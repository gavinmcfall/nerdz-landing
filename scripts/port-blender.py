#!/usr/bin/env python3
"""Extract the legacy Blender HTML field manual into a structured DATA file
(the single source of truth) plus a web React component that renders it
for screen.

Two outputs:
  1. src/data/blender-sections.json  — sections/rows/notes as raw HTML.
     Consumed by BOTH the web component (React) and the PDF renderer
     (scripts/render_pdf.py via WeasyPrint). Raw HTML (`class=`, not
     `className=`) is correct for dangerouslySetInnerHTML, which sets
     innerHTML, and for WeasyPrint, which renders real HTML.
  2. src/components/BlenderManual.tsx — SCREEN-ONLY web view.
     No @page, no @media print — print is a separate surface rendered
     by render_pdf.py. The two share only the data file.

Content is controlled by this script (not user input), so rendering the
row HTML via dangerouslySetInnerHTML is safe.
"""

from __future__ import annotations
import html
import json
import re
from pathlib import Path

ROOT = Path.home() / "my_other_repos/nerdz/nerdz-guides"
SRC  = Path.home() / "my_other_repos/Cheat Sheets/docs/3d-modeling/blender.html"
DATA_DST = ROOT / "src/data/blender-sections.json"
WEB_DST  = ROOT / "src/components/BlenderManual.tsx"

RAW = SRC.read_text(encoding="utf-8")

SECTION_RE = re.compile(r'<section class="(card[^"]*)">(.*?)</section>', re.DOTALL)
TITLE_RE   = re.compile(r'<h2 class="card-title">([^<]+)<span class="num">(\d+)</span></h2>')
ROW_RE     = re.compile(r'<div class="row"><span class="desc">(.*?)</span><span class="keys">(.*?)</span></div>', re.DOTALL)
NOTE_RE    = re.compile(r'<div class="note">(.*?)</div>', re.DOTALL)
TWO_COL_RE = re.compile(r'<div class="body">\s*<div>(.*?)</div>\s*<div>(.*?)</div>\s*</div>', re.DOTALL)


def keep_html(s: str) -> str:
    """Preserve raw HTML (with `class=`) — correct for both
    dangerouslySetInnerHTML (sets innerHTML) and WeasyPrint (renders HTML).
    Only trims surrounding whitespace."""
    return s.strip()


def decode_text(s: str) -> str:
    """Decode HTML entities for strings that pass through React as plain text."""
    return html.unescape(s)


def parse_rows(block: str) -> list[dict]:
    return [
        {"desc": keep_html(m.group(1)), "keys": keep_html(m.group(2))}
        for m in ROW_RE.finditer(block)
    ]


def parse_section(class_attr: str, body: str) -> dict:
    t = TITLE_RE.search(body)
    title = decode_text(t.group(1).strip()) if t else "(untitled)"
    num   = t.group(2) if t else "00"
    is_two_col = "two-col" in class_attr
    alt = "alt" in class_attr

    section: dict = {"num": num, "title": title, "twoCol": is_two_col, "alt": alt}

    if is_two_col:
        tc = TWO_COL_RE.search(body)
        if tc:
            section["left"]  = parse_rows(tc.group(1))
            section["right"] = parse_rows(tc.group(2))
        else:
            section["rows"] = parse_rows(body)
    else:
        section["rows"] = parse_rows(body)

    notes = [keep_html(m.group(1)) for m in NOTE_RE.finditer(body)]
    if notes:
        section["notes"] = notes
    return section


sections = [parse_section(c, b) for c, b in SECTION_RE.findall(RAW)]

# Reorder so the two double-width cards (Edit Mode, 3D Printing Workflow)
# stack one above the other in cols 2-3, with the remaining singles filling
# the right places. Resulting grid (3-col auto-flow):
#   Row 1: Navigation       | Selection      | Transform
#   Row 2: Modes & Objects  | Edit Mode (span 2)
#   Row 3: Snap, Pivot      | 3D Print (span 2)
#   Row 4: Modifiers        | Workflow Ess.  | Viewport & Display
NEW_ORDER = [
    "Navigation",
    "Selection",
    "Transform",
    "Modes",
    "Edit Mode",
    "Snap",
    "3D Printing Workflow",
    "Modifiers",
    "Workflow Essentials",
    "Viewport",
]


def order_key(s: dict) -> int:
    for i, prefix in enumerate(NEW_ORDER):
        if s["title"].startswith(prefix):
            return i
    return len(NEW_ORDER)


sections.sort(key=order_key)
# Renumber to match the new visual order rather than carrying legacy 01-10.
for i, s in enumerate(sections, 1):
    s["num"] = f"{i:02d}"

SECTIONS_JSON = json.dumps(sections, indent=2, ensure_ascii=False)


def escape_template_literal(s: str) -> str:
    """The generated TSX embeds the CSS as a backtick template literal.
    Any backticks or ${ in the CSS source would break out of the string.
    Backslash escaping covers both cases."""
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

CSS = r"""
/* SCREEN-ONLY styling for the web view. Rules are prefixed with
   `.blender-manual ` (plain descendant selectors). Print is a wholly
   separate surface — a real PDF from scripts/render_pdf.py via WeasyPrint
   — so there is no @page / @media print here. */
.blender-manual {
  background: var(--paper-soft);
  color: var(--ink);
  padding: 20px 24px;
  min-height: 100%;
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}
.blender-manual .bc-head {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--rule-strong);
}
.blender-manual .bc-title {
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: -0.025em;
  margin: 0;
  color: var(--ink);
  line-height: 1;
}
.blender-manual .bc-title em {
  font-style: italic; font-weight: 500; color: var(--purple);
}
.blender-manual .bc-tag {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--ink-mute);
}
/* On-screen: 3-col landscape grid (paper container is 1123x794).
   Print orientation is overridden to portrait below — they're
   independent surfaces. */
.blender-manual .bc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: stretch;
}
.blender-manual .bc-card {
  background: var(--paper-card);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  padding: 12px 16px 14px;
  position: relative;
  display: flex;
  flex-direction: column;
}
.blender-manual .bc-card.two-col { grid-column: span 2; }
.blender-manual .bc-card-title {
  display: flex; align-items: baseline; justify-content: space-between;
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
  margin: 0 0 8px;
  padding-bottom: 5px;
  border-bottom: 1px dashed var(--rule);
  color: var(--ink);
  line-height: 1.2;
}
.blender-manual .bc-num {
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-style: italic;
  font-weight: 400;
  font-size: 20px;
  color: var(--gold);
  line-height: 1;
}
.blender-manual .bc-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 20px;
}
.blender-manual .row {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 10px;
  padding: 3px 0;
  border-bottom: 1px solid rgba(10, 7, 18, 0.05);
  font-size: 12.5px;
  line-height: 1.45;
}
.blender-manual .row:last-child { border-bottom: 0; }
.blender-manual .desc { color: var(--ink-mid); flex: 1; min-width: 0; }
.blender-manual .desc b { font-weight: 600; color: var(--ink); }
.blender-manual .keys { text-align: right; white-space: nowrap; }
.blender-manual kbd {
  display: inline-block;
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  background: var(--paper-deep);
  color: var(--ink);
  border: 1px solid var(--rule);
  border-bottom-width: 2px;
  border-radius: 3px;
  line-height: 1.4;
  vertical-align: baseline;
}
.blender-manual kbd.mouse  { background: #ece4d0; }
.blender-manual kbd.accent { background: var(--purple); color: var(--paper); border-color: var(--purple); }
.blender-manual .plus { color: var(--ink-dim); margin: 0 2px; font-size: 11px; }
.blender-manual .or   { color: var(--ink-mute); font-style: italic; font-size: 11px; margin-left: 4px; }
.blender-manual .note {
  margin-top: 8px;
  padding-top: 5px;
  border-top: 1px dashed var(--rule);
  font-style: italic;
  font-size: 11.5px;
  color: var(--ink-mute);
  line-height: 1.4;
}
.blender-manual .note strong { font-style: normal; color: var(--ink); font-weight: 600; }

/* SCREEN ONLY. There is deliberately no @media print or @page here —
   the printable artifact is a real PDF rendered by scripts/render_pdf.py
   through WeasyPrint, from the same data file. Web and print share data,
   not CSS. */
@media (max-width: 980px) {
  .blender-manual .bc-grid { grid-template-columns: repeat(2, 1fr); }
  .blender-manual .bc-card.two-col { grid-column: span 2; }
}
@media (max-width: 620px) {
  .blender-manual .bc-grid, .blender-manual .bc-cols { grid-template-columns: 1fr; }
  .blender-manual .bc-card.two-col { grid-column: span 1; }
}
"""

WEB = f"""// AUTO-GENERATED by scripts/port-blender.py — do not edit by hand.
// SCREEN-ONLY web view. Section data lives in src/data/blender-sections.json
// (the source of truth, also consumed by scripts/render_pdf.py for the PDF).
// Row HTML is rendered via dangerouslySetInnerHTML (raw `class=` is correct
// for innerHTML); content is script-controlled, not user input.
import sections from "@/data/blender-sections.json";

type Row = {{ desc: string; keys: string }};
type SectionT = {{
  num: string;
  title: string;
  twoCol: boolean;
  alt: boolean;
  rows?: Row[];
  left?: Row[];
  right?: Row[];
  notes?: string[];
}};

const SECTIONS = sections as SectionT[];

const STYLES = `{escape_template_literal(CSS)}`;

function Row({{ desc, keys }}: {{ desc: string; keys: string }}) {{
  return (
    <div className="row">
      <span className="desc" dangerouslySetInnerHTML={{{{ __html: desc }}}} />
      <span className="keys" dangerouslySetInnerHTML={{{{ __html: keys }}}} />
    </div>
  );
}}

function Card({{ section }}: {{ section: SectionT }}) {{
  const cls = `bc-card${{section.twoCol ? " two-col" : ""}}${{section.alt ? " alt" : ""}}`;
  return (
    <section className={{cls}}>
      <h2 className="bc-card-title">
        <span>{{section.title}}</span>
        <span className="bc-num">{{section.num}}</span>
      </h2>
      {{section.twoCol && section.left && section.right ? (
        <div className="bc-cols">
          <div>{{section.left.map((r, i) => <Row key={{i}} {{...r}} />)}}</div>
          <div>{{section.right.map((r, i) => <Row key={{i}} {{...r}} />)}}</div>
        </div>
      ) : (
        section.rows?.map((r, i) => <Row key={{i}} {{...r}} />)
      )}}
      {{section.notes?.map((n, i) => (
        <div key={{i}} className="note" dangerouslySetInnerHTML={{{{ __html: n }}}} />
      ))}}
    </section>
  );
}}

export function BlenderManual() {{
  return (
    <>
      <style dangerouslySetInnerHTML={{{{ __html: STYLES }}}} />
      <div className="blender-manual">
        <header className="bc-head">
          <h1 className="bc-title">Blender <em>Modelling</em></h1>
          <span className="bc-tag">3D modelling reference</span>
        </header>
        <div className="bc-grid">
          {{SECTIONS.map((s) => <Card key={{s.num}} section={{s}} />)}}
        </div>
      </div>
    </>
  );
}}
"""

DATA_DST.parent.mkdir(parents=True, exist_ok=True)
DATA_DST.write_text(SECTIONS_JSON + "\n", encoding="utf-8")
WEB_DST.write_text(WEB, encoding="utf-8")
print(f"wrote {DATA_DST}: {len(sections)} sections")
print(f"wrote {WEB_DST}: {len(WEB.splitlines())} lines")
