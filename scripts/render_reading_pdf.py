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

# Two layouts: dense chapter grids (EOS/ToD's 145 rows) get A4 landscape ×
# 5 columns; book-level orders (up to a few dozen rows, often with notes)
# get a roomier A4 portrait list. Chosen by item count — no per-guide config.
BOOK_LIST_THRESHOLD = 60


def is_book_list(guide: dict) -> bool:
    return len(guide["items"]) < BOOK_LIST_THRESHOLD


def page_size(guide: dict) -> str:
    return "A4 portrait" if is_book_list(guide) else "A4 landscape"


def load_guides() -> list[dict]:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def load_css(name: str) -> str:
    return (PRINT_DIR / name).read_text(encoding="utf-8")


def row_html(item: dict, accent: str, with_notes: bool, num: int | None) -> str:
    note = (
        f'<span class="rg-note">{html_lib.escape(item["note"])}</span>'
        if with_notes and item.get("note")
        else ""
    )
    # Book-list rows carry a visible step number — short lists without one
    # read ambiguously. Chapter grids stay unnumbered.
    num_html = f'<span class="rg-num">{num:02d}</span>' if num is not None else ""
    # Both classes: rg-<book key> keeps EOS/ToD's original colors; rg-a-<accent>
    # colors every other guide from its declared accent.
    return (
        f'<label class="rg-row rg-a-{accent} rg-{html_lib.escape(item["book"])}">'
        f"{num_html}"
        f'<input type="checkbox" id="{html_lib.escape(item["id"])}" '
        f'name="{html_lib.escape(item["id"])}">'
        f'<span>{html_lib.escape(item["label"])}{note}</span></label>'
    )


def build_html(guide: dict) -> str:
    book_list = is_book_list(guide)
    accent_by_book = {b["key"]: b.get("accent", "gold") for b in guide["books"]}
    rows = "".join(
        row_html(
            item,
            accent_by_book.get(item["book"], "gold"),
            with_notes=book_list,
            num=(i + 1) if book_list else None,
        )
        for i, item in enumerate(guide["items"])
    )
    legend = " ".join(
        f'<span class="rg-a-{b.get("accent", "gold")} rg-{html_lib.escape(b["key"])}">'
        f'&#9632; {html_lib.escape(b["title"])}</span>'
        for b in guide["books"]
    )

    base = (
        load_css("base.css")
        .replace("__PAGE_SIZE__", page_size(guide))
        .replace("__SHEET_TITLE__", guide["title"].replace('"', "'"))
    )
    layout = load_css("reading.css")

    # Head title: EOS/ToD keeps its bespoke italic split; other guides em the
    # part after an em-dash ("Skyward — Reading Order" → Skyward <em>…</em>).
    if guide["slug"] == "eos-tod-reading-order":
        head_title = "Empire of Storms <em>&amp; Tower of Dawn</em>"
        sub = "tandem reading order"
    else:
        parts = guide["title"].split(" — ", 1)
        if len(parts) == 2:
            head_title = (
                f"{html_lib.escape(parts[0])} <em>{html_lib.escape(parts[1])}</em>"
            )
        else:
            head_title = html_lib.escape(guide["title"])
        sub = "reading order"

    cols_class = "rg-cols rg-cols--list" if book_list else "rg-cols"
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<style>{base}\n{layout}</style>
</head><body>
<div class="sheet-head">
  <h1>{head_title}</h1>
  <span class="sheet-sub">{sub} &middot; nerdz.cloud/reading</span>
</div>
<p class="rg-intro">{html_lib.escape(guide["intro"])}</p>
<div class="rg-legend">{legend}</div>
<div class="{cols_class}">{rows}</div>
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
