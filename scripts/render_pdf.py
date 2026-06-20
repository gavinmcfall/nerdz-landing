#!/home/gavin/home-ops/.venv/bin/python3
"""Render field manual(s) to print-ready PDF via WeasyPrint.

Generic across sheet types. The on-screen view (Next.js) and the PDF share
only the source DATA (src/data/<slug>-sections.json) — never CSS. Each
surface is tuned for what it is: scroll vs paper.

WeasyPrint implements the full CSS Paged Media spec, so @page margin boxes,
counter(page), running headers etc. work natively (unlike browser print
engines or the Paged.js polyfill).

Usage:
    render_pdf.py <slug>        # one sheet
    render_pdf.py --all         # every sheet in src/sheets/

Output: public/field manuals/<slug>.pdf
"""

from __future__ import annotations

import argparse
import html as html_lib
import json
import sys
from pathlib import Path

import yaml
from markdown_it import MarkdownIt
from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
MANUALS_DIR = ROOT / "src" / "manuals"
DATA_DIR = ROOT / "src" / "data"
PRINT_DIR = ROOT / "scripts" / "print"
OUT_DIR = ROOT / "public" / "manuals"

PAGE_SIZE_MAP = {
    "A4-portrait": "A4 portrait",
    "A4-landscape": "A4 landscape",
    "Letter-portrait": "letter portrait",
    "Letter-landscape": "letter landscape",
    "A3-landscape": "A3 landscape",
}


# ── Frontmatter ───────────────────────────────────────────────

def read_frontmatter(slug: str) -> dict:
    path = MANUALS_DIR / f"{slug}.mdx"
    if not path.exists():
        raise FileNotFoundError(f"no sheet at {path}")
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        raise ValueError(f"{path} has no frontmatter")
    _, fm, _ = text.split("---", 2)
    data = yaml.safe_load(fm) or {}
    return data


def read_body(slug: str) -> str:
    """The MDX content after the frontmatter block."""
    text = (MANUALS_DIR / f"{slug}.mdx").read_text(encoding="utf-8")
    if text.startswith("---"):
        return text.split("---", 2)[2]
    return text


def page_size(fm: dict) -> str:
    # printPaperSize wins for the PDF; falls back to the on-screen paperSize.
    key = fm.get("printPaperSize") or fm.get("paperSize") or "A4-portrait"
    return PAGE_SIZE_MAP.get(key, "A4 portrait")


# ── Body renderers (dispatch by type) ─────────────────────────

def _rows_html(rows: list[dict]) -> str:
    return "".join(
        f'<div class="row"><span class="desc">{r["desc"]}</span>'
        f'<span class="keys">{r["keys"]}</span></div>'
        for r in rows
    )


def render_component_body(slug: str) -> str:
    """Card layout from the sections data file. CSS grid with row-major
    (horizontal, left-to-right) reading order to match the legacy sheet.
    twoCol cards span 2 columns and render their left/right split internally
    — this widens+shortens the tall cards so row heights balance, the trick
    the original hand-laid layout used to avoid big gaps."""
    data_path = DATA_DIR / f"{slug}-sections.json"
    if not data_path.exists():
        raise FileNotFoundError(
            f"component sheet '{slug}' needs {data_path} (run its port script)"
        )
    sections = json.loads(data_path.read_text(encoding="utf-8"))

    cards = []
    for s in sections:
        two_col = s.get("twoCol") and (s.get("left") or s.get("right"))
        if two_col:
            body = (
                f'<div class="bc-cols"><div>{_rows_html(s.get("left") or [])}</div>'
                f'<div>{_rows_html(s.get("right") or [])}</div></div>'
            )
        else:
            body = _rows_html(s.get("rows") or [])

        notes_html = "".join(
            f'<div class="note">{n}</div>' for n in s.get("notes", [])
        )
        cls = "bc-card span2" if two_col else "bc-card"
        cards.append(
            f'<section class="{cls}">'
            f'<h2 class="bc-card-title"><span>{html_lib.escape(s["title"])}</span>'
            f'<span class="bc-num">{s["num"]}</span></h2>'
            f"{body}{notes_html}</section>"
        )
    return f'<div class="sheet-body">{"".join(cards)}</div>'


def render_addon_body(slug: str) -> str:
    """Addon-cheatsheet layout from <slug>.json: a flat ordered list of
    band / menu / card / footer items. The menu card, category bands, and
    footer render as full-width BLOCK elements; each category's cards sit in
    their own 2-col grid (.ad-cat). This deliberately avoids full-width grid
    spanning (grid-column: 1 / -1), which WeasyPrint's grid implementation
    does not handle — spanning items there collapse and corrupt track sizing.
    Inline-HTML fields (desc, keys, notes) pass through raw; what/when and the
    plain-text fields (name, title, category, sub, num) are escaped — matching
    how the web component (BlenderAddonsManual) renders them."""
    data_path = DATA_DIR / f"{slug}.json"
    if not data_path.exists():
        raise FileNotFoundError(
            f"addon sheet '{slug}' needs {data_path} (hand-authored data file)"
        )
    items = json.loads(data_path.read_text(encoding="utf-8"))

    out = []
    cat_open = False

    def close_cat() -> None:
        nonlocal cat_open
        if cat_open:
            out.append("</div>")
            cat_open = False

    def card_html(it: dict) -> str:
        badge = '<span class="ad-badge">menu-only</span>' if it.get("menuOnly") else ""
        sub = f'<div class="ad-sub">{html_lib.escape(it["sub"])}</div>' if it.get("sub") else ""
        what = f'<p class="ad-what">{html_lib.escape(it["what"])}</p>' if it.get("what") else ""
        when = (
            f'<p class="ad-when"><span>When</span> {html_lib.escape(it["when"])}</p>'
            if it.get("when") else ""
        )
        notes = "".join(f'<div class="note">{n}</div>' for n in it.get("notes", []))
        return (
            '<section class="ad-card">'
            f'<h2 class="ad-name">{html_lib.escape(it["name"])}{badge}</h2>'
            f'{sub}{what}{when}{_rows_html(it.get("shortcuts", []))}{notes}'
            "</section>"
        )

    for it in items:
        kind = it.get("kind")
        if kind == "band":
            close_cat()
            out.append(
                '<div class="ad-band">'
                f'<span>{html_lib.escape(it["category"])}</span>'
                f'<span class="ad-band-num">{html_lib.escape(it.get("num", ""))}</span>'
                "</div>"
            )
            out.append('<div class="ad-cat">')
            cat_open = True
        elif kind == "menu":
            close_cat()
            out.append(
                '<section class="ad-card ad-menu">'
                f'<h2 class="ad-name">{html_lib.escape(it["title"])}</h2>'
                f'{_rows_html(it.get("rows", []))}'
                "</section>"
            )
        elif kind == "footer":
            close_cat()
            out.append(f'<div class="ad-foot">{html_lib.escape(it["text"])}</div>')
        else:  # card
            out.append(card_html(it))
    close_cat()
    return f'<div class="sheet-body">{"".join(out)}</div>'


def render_prose_body(slug: str) -> str:
    """Prose sheets render their MDX markdown body to HTML. Prose MDX here is
    plain CommonMark (+ GFM tables) with no JSX, so markdown-it-py renders it
    faithfully. (gfm-like would pull in linkify, which isn't installed; the
    commonmark preset + the table rule covers what these sheets use.)"""
    md = MarkdownIt("commonmark").enable("table")
    return f'<div class="sheet-body sheet-body--prose">{md.render(read_body(slug))}</div>'


def render_poster_body(slug: str, fm: dict) -> str:
    # STUB: poster sheets are a single full-page image. Not yet wired.
    asset = fm.get("posterAsset", "")
    return (
        '<div class="sheet-body">'
        f'<p style="font-style:italic;color:#888">Poster print layout not yet '
        f"implemented (asset: {html_lib.escape(asset)}).</p></div>"
    )


BODY_RENDERERS = {
    "component": lambda slug, fm: render_component_body(slug),
    "prose": lambda slug, fm: render_prose_body(slug),
    "poster": lambda slug, fm: render_poster_body(slug, fm),
    "addons": lambda slug, fm: render_addon_body(slug),
}

# Per-type layout CSS appended after base.css.
TYPE_CSS = {
    "component": "component.css",
    "prose": "prose.css",
    "poster": "component.css",
    "addons": "component-addons.css",
}


# ── Assembly ──────────────────────────────────────────────────

def load_css(name: str) -> str:
    return (PRINT_DIR / name).read_text(encoding="utf-8")


def build_html(slug: str, fm: dict) -> str:
    sheet_type = fm.get("type", "component")
    layout_key = fm.get("printLayout") or sheet_type
    title = fm.get("title", slug)

    renderer = BODY_RENDERERS.get(layout_key)
    if renderer is None:
        raise ValueError(f"unknown layout '{layout_key}' for {slug}")
    body = renderer(slug, fm)

    base = (
        load_css("base.css")
        .replace("__PAGE_SIZE__", page_size(fm))
        .replace("__SHEET_TITLE__", title.replace('"', "'"))
    )
    layout = load_css(TYPE_CSS.get(layout_key, "component.css"))

    # Title em: render "Blender Modelling" as "Blender <em>Modelling</em>"
    # (italic second word) to echo the web header, when there are 2 words.
    parts = title.split(" ", 1)
    if len(parts) == 2:
        head_title = f"{html_lib.escape(parts[0])} <em>{html_lib.escape(parts[1])}</em>"
    else:
        head_title = html_lib.escape(title)
    sub = fm.get("category", "")

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<style>{base}\n{layout}</style>
</head><body>
<div class="sheet-head">
  <h1>{head_title}</h1>
  <span class="sheet-sub">{html_lib.escape(sub)}</span>
</div>
{body}
</body></html>"""


def render(slug: str) -> Path:
    fm = read_frontmatter(slug)
    doc_html = build_html(slug, fm)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{slug}.pdf"
    HTML(string=doc_html, base_url=str(ROOT)).write_pdf(str(out))
    return out


def all_slugs() -> list[str]:
    return sorted(p.stem for p in MANUALS_DIR.glob("*.mdx"))


def main() -> int:
    ap = argparse.ArgumentParser(description="Render field manual PDFs via WeasyPrint")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("slug", nargs="?", help="sheet slug (filename without .mdx)")
    g.add_argument("--all", action="store_true", help="render every sheet")
    args = ap.parse_args()

    slugs = all_slugs() if args.all else [args.slug]
    rc = 0
    for slug in slugs:
        try:
            out = render(slug)
            print(f"✓ {slug} → {out.relative_to(ROOT)}")
        except Exception as e:  # noqa: BLE001 — report per-sheet, keep going
            print(f"✗ {slug}: {e}", file=sys.stderr)
            rc = 1
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
