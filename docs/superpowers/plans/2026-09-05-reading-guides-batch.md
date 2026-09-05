# Reading Guides Batch — Implementation Plan / Todo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Six more reading-order guides on `/reading` (book-level orders, unlike EOS/ToD's chapter grid), selected from the household shelve cache (`G:\code\Projects\nerdz-reading\data\_shelve_cache.json`) for having genuinely non-obvious orders.

**Architecture:** Same single-source pattern as EOS/ToD (`src/lib/reading.data.json` → web checklist + WeasyPrint PDF), with small schema/render extensions for book-level guides. Every order is verified against the author's official guidance or equivalent authoritative source before authoring — no orders from memory.

**Spec:** `docs/superpowers/specs/2026-08-26-reading-guides-design.md` (data model) + this doc.

## Global Constraints

- Item IDs stable/content-derived; never positional.
- Verify each series' canonical order via web sources at authoring time; cite the source in the guide's data-authoring commit message.
- Book-level guides hand-author their JSON entries (7–25 items); `scripts/gen-reading-eos-tod.mjs` must stop clobbering them (upsert, not overwrite).
- Deploy via push-to-main only (`DeployViaCiOnly`).
- Commit trailer: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## Tasks

### Task 0: Infrastructure extensions for book-level guides
- [ ] Schema (`src/lib/reading.ts`): accent enum grows to `gold | glow | magenta | ink`; items gain optional `note` (short annotation, e.g. "novella — read before Defiant").
- [ ] `reading.css`: accent classes for `magenta`/`ink`; `.rg-item__note` styling (small, muted, under label).
- [ ] `ReadingGuide.tsx`: render `note` when present.
- [ ] `gen-reading-eos-tod.mjs`: read existing `reading.data.json`, replace only the `eos-tod-reading-order` entry, preserve others.
- [ ] `render_reading_pdf.py` + `scripts/print/reading.css`: `book-list` layout (auto when items < 30): A4 portrait, 1–2 columns, larger type, notes rendered; chapter-grid layout unchanged for EOS/ToD.
- [ ] Verify: build + regen EOS/ToD (must round-trip unchanged) + re-render its PDF (must still be the 5-col landscape sheet).

### Task 1: Skyward (Sanderson) — tandem novels + Skyward Flight novellas
- [ ] Verify official order (Sanderson's site/FAQ): expected Skyward → Starsight → Sunreach → ReDawn → Cytonic → Evershore → Defiant; confirm before authoring.
- [ ] Author guide (accents: novels gold, novellas glow; notes on novella placement), render PDF, verify web+PDF, commit.

### Task 2: The Cosmere (Sanderson) — recommended entry order
- [ ] Verify current official/recommended order for the books ON THE SHELF (Mistborn era 1+2, Warbreaker, Elantris, Tress, Sunlit Man, Frugal Wizard is NOT Cosmere — confirm and exclude) + note Stormlight's slot even though unshelved; Secret History spoiler placement note.
- [ ] Author guide with notes carrying the "why this slot" caveats, PDF, verify, commit.

### Task 3: Immortals After Dark (Kresley Cole) — official reading order
- [ ] Verify Cole's official IAD order (novella #1 The Warlord Wants Forever; Deep Kiss of Winter/Shadow's Claim/Dacians placement).
- [ ] Author guide (15 shelved books marked; include unshelved entries too — a reading order with gaps is useless), PDF, verify, commit.

### Task 4: Breeds (Lora Leigh) — chronological order untangled
- [ ] Verify the accepted chronological order (Feline/Wolf/Coyote sub-series merged; publication ≠ numbering ≠ chronology).
- [ ] Author guide (sub-series accents; full canonical list, shelved-or-not), PDF, verify, commit.

### Task 5: Dark-Hunter universe (Kenyon) — official order incl. Acheron/Styxx tandem
- [ ] Verify Kenyon's official reading order (Dark-/Were-/Dream-Hunter interleave; Acheron↔Styxx parallel pair treatment).
- [ ] Decide scope with Gavin if the full list (30+) feels heavy vs. a "first arc" guide — flag before authoring.
- [ ] Author guide, PDF, verify, commit.

### Task 6: Iron Fey (Julie Kagawa) — series + novellas + spin-offs
- [ ] Verify official order (Winter's Passage 1.5, Summer's Crossing 3.5, Iron's Prophecy 4.5, Call of the Forgotten, Evenfall).
- [ ] Author guide, PDF, verify, commit.

### Task 7: Feehan universe — format decision, then maybe build
- [ ] This one is a universe MAP (which series connect, what order between series) more than a checklist. Present a format proposal to Gavin before building anything.

### Task 8: Ship + housekeeping (per guide and at end)
- [ ] Push per completed guide (CI deploys); verify live route + PDF 200.
- [ ] Journal + worklog entries; final summary with links.
