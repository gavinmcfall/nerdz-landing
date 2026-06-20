# Design: `blender-addons` field manual

**Date:** 2026-06-20
**Status:** Approved (design), pending implementation plan
**Source content:** `E:\Tri-Dimensional\Blender Addons\CHEATSHEET.md`

## Goal

Add a second Blender field manual — a hard-surface **addon** cheatsheet — as a
sibling to the existing `blender` (Blender Modelling) sheet. Polished
`component`-type sheet with the same keycap aesthetic, sourced from
`CHEATSHEET.md`.

## Guiding principle (inherited from the existing manuals)

Web and print share **data, not CSS**. One JSON data file is the source of
truth; two independent renderers consume it — a React component (web) and
`render_pdf.py` via WeasyPrint (print). Each surface is tuned for what it is
(scroll vs paper). This design follows that pattern exactly and disturbs no
existing behavior.

## Decisions (locked during brainstorming)

| Question | Decision |
|---|---|
| Structure | Separate sibling manual (own slug, page, PDF, gallery card) |
| Visual style | Bespoke `component` cards (full keycap polish) |
| Card model | One card per addon, full-width category band headers |
| Paper / pages | A4 portrait, ~2 pages, 2-column grid |
| Menu-opener table | Keep — as a leading intro card |
| Menu-only badges | Keep — pill badge on cards with no keybind |
| Blender 3MF entry | Drop (and the now-empty Import/Export category) |
| Footer caveat | Keep — small italic line below the grid |
| Per-card numbers | None — category bands carry the `01…06` index |
| Data source | Hand-authored JSON (no port script — source is static) |

## Identity

- **Slug:** `blender-addons` → `/manuals/blender-addons`, PDF at
  `/manuals/blender-addons.pdf`, auto-listed in the `/manuals` gallery.
- **Title:** `Blender Addons` (renders "Blender *Addons*" — second word
  italic-purple, matching "Blender *Modelling*").
- **Category:** `Hard-Surface Toolkit`
- **type:** `component` · **paperSize:** `A4-portrait` · **printPaperSize:** `A4-portrait`
- **printLayout:** `addons` (new optional frontmatter field; see PDF section)

## Components

### 1. `src/data/blender-addons.json` — single source of truth

Hand-authored transcription of `CHEATSHEET.md`. A flat ordered array of items
with a `kind` discriminator:

```jsonc
// category header, spans full width
{ "kind": "band", "num": "01", "category": "Cutting & Booleans" }

// addon card
{
  "kind": "card",
  "name": "Hard Ops",
  "menuOnly": false,
  "what": "Hub of the hard-surface workflow — booleans, bevels, mirroring, modifier management, and material/viewport helpers, all behind one menu.",
  "when": "Any destructive/boolean hard-surface work; managing the modifier stack.",
  "shortcuts": [
    { "keys": "<kbd>Q</kbd>", "desc": "main menu" },
    { "keys": "<kbd>Shift</kbd>+<kbd>Q</kbd>", "desc": "pie menu" }
  ],
  "notes": ["..."]   // optional — menu paths, "while live:" key sequences
}
```

Plus one leading special card for the **menu-opener table** (Edge menu →
`Ctrl+E`, Vertex menu → `Ctrl+V`, Face menu → `Ctrl+F`, Context menu →
Right-click, Object menu → `Object ▾` header), rendered with the same
row/notes shape.

The `keys`/`desc` rows and `notes` blocks deliberately reuse the Modelling
card's structure so styling stays consistent across both sheets. `keys` and
`desc` carry small inline HTML (`<kbd>`, `<b>`) injected via
`dangerouslySetInnerHTML` (script-controlled content, mirrors `BlenderManual`).

**Content inventory:**

- **01 Cutting & Booleans:** Hard Ops, BoxCutter, PUNCHit
- **02 Surface Refinement:** MESHmachine, Edge Flow *(menu-only)*
- **03 Curves:** CURVEmachine, Curves to Mesh
- **04 CAD-Style Precision:** Construction Lines, Grid Modeler *(menu-only)*,
  Mesh Align Plus, Simple Bend *(menu-only)*
- **05 Workflow & Utility:** MACHIN3tools, Quick Snap, Select Sim *(menu-only)*,
  Mesh Copier *(menu-only)*, Conform Object *(menu-only)*
- **06 Detailing Assets:** Just Panels

17 addon cards + 1 menu-opener card across 6 category bands. Footer caveat:
"Shortcuts reflect the addons' default keymaps as verified in Blender 5.0 (no
personal overrides)."

### 2. `src/manuals/blender-addons.mdx`

Three meaningful lines: frontmatter + `import { BlenderAddonsManual }` +
`<BlenderAddonsManual />`. Frontmatter carries title, slug, type, paperSize,
printPaperSize, printLayout, category, tags, updated, summary.

### 3. `src/components/BlenderAddonsManual.tsx` — web renderer

New component parallel to `BlenderManual.tsx` (existing component untouched).
Reads `blender-addons.json`, renders a scoped `.blender-addons` block with its
own inline `<style>`:

- 2-column CSS grid; `kind:"band"` items span full width (`grid-column: 1/-1`)
  as category headers; `kind:"card"` items render name + optional menu-only
  badge + *what* + *When:* line + shortcut rows + optional notes.
- Own header: "Blender *Addons*" + tag "Hard-surface toolkit".
- Footer caveat line below the grid.
- Shared paper palette tokens; responsive 2→1 column on narrow screens.
- No `@page` / `@media print` — print is the separate PDF.

**No changes** to `page.tsx`, `ManualLayout.tsx`, `manuals.css`, or the gallery:
component-type sheets already render generically (page imports the MDX, renders
its default export; `ManualLayout` shows no header for `component`;
`.manual--component` zeroes padding; gallery auto-lists from `listManuals()`).

### 4. PDF renderer — `scripts/render_pdf.py` + `scripts/print/component-addons.css`

- Add `render_addon_body(slug)` that reads the same JSON and emits band/card
  HTML for paper.
- Dispatch the body renderer on `fm.get("printLayout") or fm.get("type")`, so a
  `component` sheet can opt into a specialized print renderer. The generic
  `component` path (Modelling) is untouched; default behavior unchanged.
- Map `printLayout: addons` → `render_addon_body` + `component-addons.css`.
- New `scripts/print/component-addons.css`: 2-col grid, `break-inside: avoid`
  on cards, full-width bands with `break-after: avoid` (a band never orphans
  from its cards at a page break), badge pill, *what/when* type styles, footer
  line. Reuses `base.css` tokens and the `@page` chrome (running header, page
  counter, `nerdz.cloud` footer). Flows to ~2 portrait pages.
- `render_pdf.py` reads frontmatter via YAML directly (not through zod), so it
  sees `printLayout` regardless of the schema.

### 5. Schema — `src/lib/manuals.ts`

Add `printLayout: z.string().optional()` to `FrontmatterSchema` for
documentation. (Web doesn't consume it; it only steers the PDF renderer.)

## Build / regenerate

- `npm run gen` (auto in `dev`/`build`) regenerates `manuals.data.json` → the
  sheet appears in the gallery.
- PDF is the manual WeasyPrint step (needs the Python venv):
  `python scripts/render_pdf.py blender-addons` → output committed to
  `public/manuals/blender-addons.pdf`.
- Verify the rendered web page **and** the PDF with screenshots before declaring
  done.

## Files

**New:**
- `src/data/blender-addons.json`
- `src/manuals/blender-addons.mdx`
- `src/components/BlenderAddonsManual.tsx`
- `scripts/print/component-addons.css`
- `public/manuals/blender-addons.pdf`

**Edited (additive only):**
- `scripts/render_pdf.py` — `render_addon_body` + `printLayout` dispatch + CSS map
- `src/lib/manuals.ts` — optional `printLayout` field

## Out of scope / YAGNI

- No port script (`CHEATSHEET.md` is static; re-sync by hand if it changes).
- No new manual `type` (reuse `component` + the additive `printLayout` flag).
- Blender 3MF / Import-Export category dropped.
