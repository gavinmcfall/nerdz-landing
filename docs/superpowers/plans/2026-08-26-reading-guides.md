# Reading Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** New `/reading` area: hub page + interactive EOS/TOD alternating-reading-order checklist with localStorage persistence, and a fillable/printable PDF.

**Architecture:** One data source (`src/lib/reading.data.json`, zod-validated by `src/lib/reading.ts`) drives both the web checklist (client component with localStorage) and a WeasyPrint-rendered PDF with AcroForm checkboxes. Mirrors the manuals pattern: bundled JSON (Cloudflare Worker has no runtime fs), pre-rendered PDF committed under `public/`.

**Tech Stack:** Next.js 16 App Router, React 19, zod 3, WeasyPrint (WSL venv at `/home/gavin/home-ops/.venv`), CSS with the shell token palette.

**Spec:** `docs/superpowers/specs/2026-08-26-reading-guides-design.md`

## Global Constraints

- No runtime filesystem access (OpenNext on Cloudflare Workers) — all guide data imported as bundled JSON.
- `[slug]` route must set `export const dynamic = "force-dynamic"` (same OpenNext prerender constraint as `src/app/manuals/[slug]/page.tsx`).
- Item IDs are stable/content-derived (`eos-1`, `tod-fireheart`), never positional.
- localStorage key: `nerdz.reading.<slug>`; value `{ "v": 1, "checked": string[] }`.
- Style with existing shell tokens only (`--paper*`, `--ink*`, `--glow`, `--gold`, `--rule`, `--radius`) so light/dark themes both work; no hard-coded colors on the web side.
- No test harness exists in this repo (no `npm test`); verification is `npm run lint` + `npm run build` + a browser interaction pass + opening the PDF. Do not add a test framework for this feature.
- Commit trailers per user rules: `Assisted-by: Claude Code (claude-fable-5)` + `Agentically-Engineered: https://nerdz.cloud/agentic-engineering`.

## Checklist Content (authoritative)

Order transcribed from Gavin's source image (typo "CH55T/ower of Dawn CH56" corrected to ToD CH55, CH56). Run-length notation, expand in order; `eos:N-M` means EOS chapters N..M inclusive:

```
eos:Nightfall, eos:1-5, tod:1, eos:6-8, tod:2-3, eos:9-10, tod:4-6, eos:11,
tod:7, eos:12-13, tod:8-10, eos:14-16, tod:11-12, eos:17-18, tod:13-16,
eos:19, tod:17, eos:20-23, tod:18-21, eos:24-25, tod:22-23, eos:26, tod:24,
eos:27-29, tod:25-28, eos:30, tod:29-31, eos:31, tod:32, eos:32, tod:33-35,
eos:33-51, tod:36-37, eos:52, tod:38-40, eos:53, tod:41-42, eos:54-56,
tod:43, eos:57-59, tod:44-48, eos:60-61, tod:49-51, eos:62-63, tod:52-53,
eos:64-65, tod:54-56, eos:66-67, tod:57, eos:68-75, tod:58-68, tod:Fireheart
```

Invariants (assert when generating): 145 items total; EOS = Nightfall + CH1–75 (76); TOD = CH1–68 + Fireheart (69); every chapter exactly once.

Item shape: chapter → `{ "id": "eos-17", "book": "eos", "label": "Empire of Storms CH17" }`; novella endpoints → `{ "id": "eos-nightfall", "book": "eos", "label": "EOS — Nightfall" }`, `{ "id": "tod-fireheart", "book": "tod", "label": "TOD — Fireheart" }`.

---

### Task 1: Guide data + typed accessor

**Files:**
- Create: `scripts/gen-reading-eos-tod.mjs` (one-off generator, kept for regeneration)
- Create: `src/lib/reading.data.json` (generated)
- Create: `src/lib/reading.ts`

**Interfaces:**
- Produces: `type ReadingGuide = { slug: string; title: string; summary: string; intro: string; updated: string; books: { key: string; title: string; accent: "gold" | "glow" }[]; items: { id: string; book: string; label: string }[] }`; `listGuides(): Promise<ReadingGuide[]>`; `getGuide(slug: string): Promise<ReadingGuide | null>`.

- [x] **Step 1: Write the generator** embedding the run-length sequence above; it expands items, asserts the invariants (145/76/69, no duplicate ids), and writes `src/lib/reading.data.json` containing one guide:
  - slug `eos-tod-reading-order`; title `Empire of Storms & Tower of Dawn — Tandem Reading Order`; summary `Read EOS and ToD together in alternating chronological order — an interactive checklist that remembers your place.`; intro (own words): `Empire of Storms and Tower of Dawn run in parallel — two stories in two places over the same stretch of time, with no overlap. You can read either first, but reading them in tandem keeps the timeline in sync: follow this list top to bottom, ticking chapters as you go. Your progress is saved in this browser.`; updated `2026-08-26`; books: eos/`Empire of Storms`/accent `gold`, tod/`Tower of Dawn`/accent `glow`.
- [x] **Step 2: Run it** (`node scripts/gen-reading-eos-tod.mjs`) — expect the assertion summary and the JSON file. Spot-check against the image: first 8 items, the seam around EOS CH51→TOD CH36, ToD 52–53 adjacency, last 13 items.
- [x] **Step 3: Write `src/lib/reading.ts`** — zod schema mirroring `src/lib/manuals.ts` (validate at module load, throw with slug context; `.refine` that every `item.book` matches a `books[].key` and ids are unique), export types + `listGuides` / `getGuide`.
- [x] **Step 4: Verify** — `npx tsc --noEmit` clean; `node` one-liner loading the JSON and printing counts.
- [x] **Step 5: Commit** `feat(reading): EOS/ToD tandem reading-order data + typed accessor`.

### Task 2: `/reading` pages + interactive checklist + nav

**Files:**
- Create: `src/app/reading/layout.tsx`, `src/app/reading/reading.css`, `src/app/reading/page.tsx`, `src/app/reading/[slug]/page.tsx`, `src/components/reading/ReadingGuide.tsx`
- Modify: `src/lib/nav.ts` (add `{ label: "reading", href: "/reading" }` after `field manuals`), `src/components/Colophon.tsx` (Index list: `Reading →` after `Field Manuals`)

**Interfaces:**
- Consumes: `listGuides` / `getGuide` / `ReadingGuide` from Task 1.
- Produces: routes `/reading` and `/reading/eos-tod-reading-order`; PDF download links point at `/reading/<slug>.pdf` (Task 3's output path).

- [x] **Step 1: `layout.tsx`** — metadata (`Reading — nerdz.cloud`, summary description) + `import "./reading.css"`, children passthrough (pattern: `src/app/manuals/layout.tsx`, minus AccessibilityMenu).
- [x] **Step 2: Hub `page.tsx`** — server component; `section.section > div.frame > SectionHead` (title `The Reading <em>shelf</em>`, caption `reading guides · checklists · what i'm reading (soon)`), then a card per guide (`rg-hub__card`): title, summary, mono meta line (`145 steps · updated 2026-08-26 · PDF`), whole card links to `/reading/<slug>`.
- [x] **Step 3: `[slug]/page.tsx`** — `force-dynamic`, `generateMetadata` from guide, `notFound()` on unknown slug, renders `<ReadingGuide guide={guide} />` inside `section.section > div.frame`.
- [x] **Step 4: `ReadingGuide.tsx`** (`"use client"`) — props `{ guide: ReadingGuide }`:
  - `checked: Set<string>` state; on mount (effect) hydrate from `localStorage[nerdz.reading.<slug>]` inside try/catch, filtering to known ids; first paint renders unticked (no hydration mismatch).
  - `toggle(id)` updates the set and persists `{ v: 1, checked: [...] }` (try/catch — storage denied just means no persistence).
  - Sticky header bar: `<progress>`-style bar (div width %), `N / 145 · P%` mono counter, buttons: `Jump to my place` (scrollIntoView on first unchecked item's `li` id `rg-item-<id>`, smooth/center), `Download PDF` (`<a href="/reading/<slug>.pdf" download>`), `Reset` (`window.confirm` guarded, clears set + storage).
  - Intro paragraph, then `<ol className="rg-list">`; each `<li id>` → `<label>` with a real `<input type="checkbox">` (visually replaced) + label text; `rg-item--gold` / `rg-item--glow` class from the item's book accent; checked rows dim + strike.
- [x] **Step 5: `reading.css`** — hub cards; sticky progress bar (`--paper-soft` bg, `--glow` fill); list as CSS columns (1 col mobile, 2 ≥720px, 3 ≥1100px, `break-inside: avoid` on items); custom checkbox (accent border, tick via `::after`); accents `color: var(--gold)` / `var(--glow)`; tokens only.
- [x] **Step 6: Nav edits** in `nav.ts` + `Colophon.tsx` as listed.
- [x] **Step 7: Verify** — `npm run lint`, `npm run build`; dev-server interaction pass: tick several, reload (persists), jump scrolls to first unchecked, reset clears after confirm, both themes legible, mobile width sane.
- [x] **Step 8: Commit** `feat(reading): /reading hub + interactive EOS/ToD checklist with saved progress`.

### Task 3: Fillable/printable PDF

**Files:**
- Create: `scripts/render_reading_pdf.py`, `scripts/print/reading.css`
- Create (generated, committed): `public/reading/eos-tod-reading-order.pdf`

**Interfaces:**
- Consumes: `src/lib/reading.data.json`.
- Produces: `public/reading/<slug>.pdf` — the path Task 2's download links already use.

- [x] **Step 1: Probe the toolchain** — `wsl -e /home/gavin/home-ops/.venv/bin/python3 -c "import weasyprint; print(weasyprint.__version__)"`. PDF form support needs ≥ 57 (`write_pdf(pdf_forms=True)`); if older, `pip install -U weasyprint` in that venv; if WSL/venv unreachable from this machine, STOP and tell Gavin what's needed rather than switching PDF tech.
- [x] **Step 2: `scripts/print/reading.css`** — `@page A4 landscape` with the field-manual margin-box header style (reuse conventions from `scripts/print/base.css`; check whether base.css can be reused directly with `__PAGE_SIZE__`/`__SHEET_TITLE__` replaced, as `render_pdf.py` does); body: intro paragraph full-width, then checklist in `columns: 5` at ~7.5pt (matches the source image's 5-column landscape density); row = checkbox input + label, `.rg-eos { color: #1c1420 }`, `.rg-tod { color: #5a0e93 }`; `break-inside: avoid`.
- [x] **Step 3: `render_reading_pdf.py`** — argparse over guide slug / `--all`; loads `reading.data.json`, builds HTML (escaped labels, `<input type="checkbox" name="<id>">` per item), assembles with the print CSS, `HTML(string=..., base_url=ROOT).write_pdf(out, pdf_forms=True)` → `public/reading/<slug>.pdf`. Same per-slug error reporting shape as `render_pdf.py`.
- [x] **Step 4: Render + verify** — run it via the WSL venv python; open the PDF: 1–2 pages, all 145 rows present (count them programmatically via a PDF lib or visual column check), checkboxes are clickable form fields (verify AcroForm entries exist, e.g. `grep -c '/FT /Btn'` on the uncompressed PDF or open in a viewer), colour split correct, prints clean in grayscale.
- [x] **Step 5: Commit** `feat(reading): fillable/printable EOS-ToD checklist PDF via WeasyPrint`.

### Task 4: Final verification + housekeeping

- [x] **Step 1:** Full pass: `npm run lint`, `npm run build`, browser pass over `/reading` + guide + PDF link 200s in dev.
- [x] **Step 2:** Update `.claude/session-journal.md` (Current state is stale — references `feat/hub-redesign`; rewrite to reflect main + this feature) and log the completion entry; worklog `CMT` entries after commits.
- [x] **Step 3:** Check `git status` for stray files (other sessions are active — commit only files from this plan).
- [x] **Step 4:** Commit any journal/doc remainder `chore(reading): journal + plan checkboxes`.

## Self-Review

- Spec coverage: data model → Task 1; hub/guide/interaction/nav → Task 2; PDF+forms → Task 3; verification → Task 4. Out-of-scope items have no tasks (correct).
- No placeholders; content and copy are spelled out.
- Type/name consistency: `listGuides`/`getGuide`/`ReadingGuide` consistent across Tasks 1–2; PDF path `/reading/<slug>.pdf` consistent across Tasks 2–3.
