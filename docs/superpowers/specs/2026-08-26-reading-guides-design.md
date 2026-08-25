# Reading Guides — Design Spec

**Date:** 2026-08-26
**Status:** Approved by Gavin (in-chat, design presented at experience level)
**Path:** Architectural (new site area)

## Purpose

A new `/reading` area on nerdz.cloud for book-reading guides. First guide: the
**Empire of Storms & Tower of Dawn alternating reading order** (Sarah J. Maas,
Throne of Glass series) — an interactive checklist the reader ticks off as they
go, with progress remembered per browser, plus a downloadable PDF with real
(fillable) checkbox form fields that also prints cleanly.

The area is deliberately a *hub*, not a one-off page: more guides will be added,
and later phases will surface live "what I'm reading" data pulled from Gavin's
reading stack (Hardcover / Audiobookshelf / BookOrbit). That integration is
**out of scope** here; the hub layout just must not preclude it.

## Requirements

- `/reading` — hub page: short intro + a card per guide (one for now), in the
  site's existing design language.
- `/reading/eos-tod-reading-order` — the guide page:
  - Intro paragraph (own words, not copied from the source image) explaining
    the alternating chronological read.
  - Full 145-step checklist in order, colour-coded by book (EOS vs TOD),
    echoing the source image's black/teal split but in the site palette.
  - Click/tap anywhere on an entry toggles its tick; saved instantly to
    `localStorage`. Single anonymous reader per browser (no profiles).
  - Progress indicator ("87 / 145 · 60%") and a "jump to where I'm up to"
    affordance (scroll to first unchecked item).
  - Reset button with confirmation, low-prominence.
  - Download PDF button.
- PDF: same visual family as the field-manual PDFs, multi-column checklist,
  checkboxes emitted as **PDF form fields** (tickable in a PDF app, printable
  for pen use). Pre-rendered at build/authoring time into `public/reading/`,
  served statically (the Cloudflare Worker has no runtime fs).

## Data model (single source of truth)

- `src/lib/reading.data.json` — array of guides:
  - `slug`, `title`, `summary`, `intro`, `updated` (YYYY-MM-DD)
  - `books`: `[{ key, title }]` — e.g. `eos` → "Empire of Storms", `tod` →
    "Tower of Dawn". Key drives colour-coding on web and PDF.
  - `items`: ordered `[{ id, book, label }]`. IDs are stable and
    content-derived (`eos-nightfall`, `eos-1` … `tod-fireheart`), **never**
    positional — fixing a transcription error must not scramble saved progress.
- `src/lib/reading.ts` — zod schema + `listGuides()` / `getGuide(slug)`,
  mirroring `src/lib/manuals.ts` (validate bundled JSON at module load; no
  runtime fs; no build-time generator needed since there is no MDX body —
  the JSON is authored directly).

### The EOS/TOD checklist content

Transcribed from Gavin's supplied image (a widely-shared fan reading order),
column by column: 145 items — EOS "Nightfall" + EOS CH1–75 (76 items) and
TOD CH1–68 + TOD "Fireheart" (69 items), interleaved. The image's typo
("CH55T / ower of Dawn CH56") is corrected to Tower of Dawn CH55 and CH56.
Every chapter of both books appears exactly once (verified: EOS 1–75 and
TOD 1–68 with no gaps or duplicates). The intro paragraph is rewritten, and
the checklist itself is an uncopyrightable ordering of facts presented in our
own design.

## Web implementation

- `src/app/reading/layout.tsx` — metadata + scoped `reading.css` (pattern:
  `src/app/manuals/layout.tsx`).
- `src/app/reading/page.tsx` — hub (server component), lists guides from
  `listGuides()`.
- `src/app/reading/[slug]/page.tsx` — server component, `force-dynamic` like
  the manuals slug route (same OpenNext/Cloudflare prerender constraint),
  404s unknown slugs, renders:
- `src/components/reading/ReadingGuide.tsx` — `'use client'` interactive
  checklist. State: `Set<string>` of checked ids, hydrated from
  `localStorage` key `nerdz.reading.<slug>` storing `{ v: 1, checked: [...] }`
  (version field so future format changes migrate instead of wiping).
  Writes on every toggle. Handles SSR hydration safely (read storage in an
  effect; render unticked first paint).
- Styling follows the existing token palette (`globals.css` paper/ink/
  purple/gold) — EOS and TOD each map to an existing accent tone.
- Navigation: `/reading` added wherever `/manuals` is linked (Topbar nav
  and/or Colophon index — match whatever pattern manuals uses today).

## PDF implementation

- `scripts/render_reading_pdf.py` — sibling of `render_pdf.py` (which is
  manuals/MDX-frontmatter-centric; the guide renderer reads
  `src/lib/reading.data.json` instead). Shares the print CSS approach:
  `scripts/print/base.css` + new `scripts/print/reading.css`.
- Layout: sheet header (title + category strip) then a multi-column checklist
  (CSS columns), one line per item: checkbox + label, colour-coded per book.
- Checkboxes emitted as `<input type="checkbox">` and rendered with
  WeasyPrint's PDF-forms support so they are real, tickable AcroForm fields.
  (Verify the installed WeasyPrint version supports forms at implementation
  time; if the venv's version is too old, upgrading it is in scope.)
- Output: `public/reading/eos-tod-reading-order.pdf`, committed like the
  manual PDFs. The guide page's Download button links to it.

## Error handling

- zod validation throws at module load on malformed guide data (build fails
  loudly, same as manuals).
- localStorage read wrapped in try/catch (private browsing / storage denied →
  page still works, just doesn't persist); malformed stored JSON → treated as
  empty, not a crash.
- Unknown guide slug → `notFound()`.

## Testing / verification

- No JS test harness exists in this repo; verification is: `npm run lint`,
  `npm run build`, manual interaction pass in the browser (tick, reload,
  persistence, reset, jump-to-progress), and opening the generated PDF to
  confirm form fields tick in a PDF viewer and the print layout is clean.
- Gavin's acceptance review happens on the live page, per his request.

## Out of scope (recorded so they aren't accidental)

- Reader profiles / multi-user tracking (decided: single anonymous reader).
- Any sync between web ticks and the PDF.
- Live reading-stack data (Hardcover/Audiobookshelf) — future phase; hub
  layout leaves room, nothing more.
