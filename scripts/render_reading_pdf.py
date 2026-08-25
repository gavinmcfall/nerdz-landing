#!/usr/bin/env python3
"""Render reading-guide checklist PDF(s) via WeasyPrint.

Sibling of render_pdf.py (which is manuals/MDX-centric): guides live in
src/lib/reading.data.json — the same bundled data that drives the web
checklist at /reading/<slug> — so web and PDF can never drift.

Checkboxes are emitted as <input type="checkbox"> and rendered with
pdf_forms=True, so the PDF carries real AcroForm fields: tickable in a PDF
app, and it prints cleanly for pen-and-paper use.

Usage (from the home-ops WSL venv, repo mounted at /mnt/g/...):
    render_reading_pdf.py <slug>
    render_reading_pdf.py --all

Output: public/reading/<slug>.pdf
"""

from __future__ import annotations

import argparse
import html as html_lib
import json
import sys
from pathlib import Path

from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "src" / "lib" / "reading.data.json"
PRINT_DIR = ROOT / "scripts" / "print"
OUT_DIR = ROOT / "public" / "reading"

PAGE_SIZE = "A4 landscape"


def load_guides() -> list[dict]:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def load_css(name: str) -> str:
    return (PRINT_DIR / name).read_text(encoding="utf-8")


def build_html(guide: dict) -> str:
    rows = "".join(
        f'<label class="rg-row rg-{html_lib.escape(item["book"])}">'
        f'<input type="checkbox" id="{html_lib.escape(item["id"])}" '
        f'name="{html_lib.escape(item["id"])}">'
        f'<span>{html_lib.escape(item["label"])}</span></label>'
        for item in guide["items"]
    )
    legend = " ".join(
        f'<span class="rg-{html_lib.escape(b["key"])}">'
        f'&#9632; {html_lib.escape(b["title"])}</span>'
        for b in guide["books"]
    )

    base = (
        load_css("base.css")
        .replace("__PAGE_SIZE__", PAGE_SIZE)
        .replace("__SHEET_TITLE__", guide["title"].replace('"', "'"))
    )
    layout = load_css("reading.css")

    # Head title echoes the web/manual style: italic accent on the second book.
    head_title = (
        "Empire of Storms <em>&amp; Tower of Dawn</em>"
        if guide["slug"] == "eos-tod-reading-order"
        else html_lib.escape(guide["title"])
    )

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<style>{base}\n{layout}</style>
</head><body>
<div class="sheet-head">
  <h1>{head_title}</h1>
  <span class="sheet-sub">tandem reading order &middot; nerdz.cloud/reading</span>
</div>
<p class="rg-intro">{html_lib.escape(guide["intro"])}</p>
<div class="rg-legend">{legend}</div>
<div class="rg-cols">{rows}</div>
</body></html>"""


def render(guide: dict) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{guide['slug']}.pdf"
    HTML(string=build_html(guide), base_url=str(ROOT)).write_pdf(
        str(out), pdf_forms=True
    )
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Render reading-guide PDFs via WeasyPrint")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("slug", nargs="?", help="guide slug")
    g.add_argument("--all", action="store_true", help="render every guide")
    args = ap.parse_args()

    guides = load_guides()
    if not args.all:
        guides = [g for g in guides if g["slug"] == args.slug]
        if not guides:
            print(f"✗ no guide with slug '{args.slug}'", file=sys.stderr)
            return 1

    rc = 0
    for guide in guides:
        try:
            out = render(guide)
            print(f"✓ {guide['slug']} → {out.relative_to(ROOT)}")
        except Exception as e:  # noqa: BLE001 — report per-guide, keep going
            print(f"✗ {guide['slug']}: {e}", file=sys.stderr)
            rc = 1
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
