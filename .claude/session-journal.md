# Session journal — nerdz-landing

## Current state

**Branch:** `main`. The hub redesign shipped long ago; the site is the personal-hub design (Topbar/Hero/Workshop/Workbench/Ramblings/Cluster/Colophon) with `/about`, `/projects`, `/lab`, `/manuals`, `/agentic-engineering` — and now `/reading`.

**Newest area — `/reading` (2026-08-26):** book reading guides. Hub at `/reading`, first guide `/reading/eos-tod-reading-order` (EOS/ToD tandem reading order, 145 steps). One data source `src/lib/reading.data.json` (+ zod accessor `src/lib/reading.ts`, generator `scripts/gen-reading-eos-tod.mjs`) drives both the interactive web checklist (`src/components/reading/ReadingGuide.tsx`, localStorage key `nerdz.reading.<slug>`, versioned payload, useSyncExternalStore) and the fillable PDF (`scripts/render_reading_pdf.py` + `scripts/print/reading.css` → `public/reading/<slug>.pdf`, WeasyPrint `pdf_forms=True` from the home-ops WSL venv at `/home/gavin/code/home-ops/.venv`, repo reachable at `/mnt/g/code/nerdz/nerdz-landing`). Spec + plan under `docs/superpowers/`. Future phase noted in spec: live "what I'm reading" data (Hardcover/Audiobookshelf) on the reading hub.

<details>
<summary>Historical: hub-redesign build notes (2026-05-17, superseded)</summary>

**Branch:** `feat/hub-redesign` (since merged).

**What changed:** Full visual rebuild of the landing page from the homelab-focused "Nerdz Cloud — Homelab Infrastructure" portfolio into Gavin's personal hub per the claude.ai design handoff bundle at `C:\Users\gavin\Downloads\Nerdz\design_handoff_nerdz_home`.

**Stack confirmed**: Next.js 16.1.6, React 19.2.3, Tailwind 4, Motion 12.34.1, lucide-react. App Router. TypeScript strict.

**New file tree under `src/`:**
- `app/layout.tsx` — rewired: Geist → IBM Plex Sans + JetBrains Mono via `next/font/google`; new metadata (title, OG, twitter)
- `app/page.tsx` — composes Topbar + Hero + CurrentlyStrip + Workshop + Workbench + Ramblings + Cluster + Colophon
- `app/globals.css` — full design-token block (paper/ink/purple/gold/glow palette), Tailwind 4 `@theme inline`, all section CSS lifted verbatim from `Spread.html`
- `components/Topbar.tsx` — sticky nav with brand dot, mono meta strip (akl,nz · cluster ok · uptime), nav with `projects/workbench/ramblings/github →`
- `components/Hero.tsx` — masthead row, big 3-line title with italic `nerdy`, deck paragraph with italic `fair source`, primary+ghost CTAs, logo box with 3 concentric rings + radial glow + `cluster online` badge, 4-cell info strip
- `components/CurrentlyStrip.tsx` — horizontal marquee (CSS keyframe, 48s loop, masked edges) with `Currently —` italic label
- `components/SectionHead.tsx` — shared `01 · The [italic] · rule · caption` header
- `components/Workshop.tsx` — `01` section. Four projects (SC Bridge, Loot Goblin, Realmstack, Postcraft) as alternating 2-col features with `Statwin` status windows (handle, status dot, 2×2 stat grid, spec→ship progress bar)
- `components/Workbench.tsx` — `02` section. 12-col asymmetric 5-card grid (Forge span-7 wide / Printers span-5 square / Dopamine Racing span-4 / Bronco span-4 tall / SC Fleet span-4). Each card has a slot placeholder ("photo soon") + title + tag + italic caption
- `components/Ramblings.tsx` — `03` section. Two ledgers side-by-side: `Of ramblings` (POSTS array, dates + titles + essay/design tags) and `The field manual` (SHEETS array, slug + titles + sheet tag)
- `components/Cluster.tsx` — `04` section. 4-up node grid (russet/yukon/kennebec/agria) with name + role + temperature + load bar, plus 3-up summary (status / avg temp / uptime). `'use client'` — uses `useNodeStats` for drifting demo telemetry
- `components/Colophon.tsx` — 4-col footer (pitch + CTAs / Elsewhere / Index / Colophon credit) + imprint row with `PressmarkPotato` SVG
- `components/PressmarkPotato.tsx` — inline SVG potato sigil (gold leaf, stroke-based)
- `components/UptimeText.tsx` — `'use client'` ticker; renders `47d HH:MM:SS` formatted uptime updated every second
- `lib/hooks.ts` — `useNodeStats()` and `useUptime()` with React-19 strict purity (all impure calls inside `setInterval`/`setTimeout` callbacks, no `setState` synchronously in effect body)
- `public/nerdz-logo.svg` — Recraft-vectorized logo (cleaner native-coord SVG, all paths white-filled)
- `public/nerdz-logo.png` — fallback PNG from the design bundle

**Removed (old design):** `components/Navbar.tsx`, `components/ClusterStats.tsx`, `components/Features.tsx`, `components/Footer.tsx`, `components/TechStack.tsx`. The old `components/Hero.tsx` was overwritten with the new one.

**Kept:** `app/api/metrics/route.ts` (existing Prometheus proxy — Phase 2 will wire it into `Cluster.tsx` to replace the demo drift).

## What's verified vs. blocked

✅ `tsc --noEmit` runs clean
✅ ESLint runs clean (fixed: `// {handle}.spec` JSX comment parse error in Workshop; React-19 purity violations in `useNodeStats`/`useUptime`)

❌ **`npm run build` could not be run in this environment.** Two blockers:
  1. UNC paths: Windows `cmd.exe` (invoked by `npm` script wrappers and by Next's spawned subprocesses) cannot have a UNC path as cwd. The repo lives at `\\wsl.localhost\home-ops\…` and there's no node binary inside the WSL distro itself (only `/mnt/c/Program Files/nodejs/node.exe` is on PATH).
  2. `lightningcss` missing `lightningcss.win32-x64-msvc.node`: the install was platform-mismatched for a Windows build.

  **User must run `npm run build` from a real Windows working directory** (e.g. their normal dev shell where the project is symlinked/mapped, or after `npm install` from the Windows side). I did get a partial Turbopack startup before it hit the lightningcss error — so the TS + JSX side is good; the css pipeline is the only thing not exercised.

## Design decisions baked in (vs. the handoff defaults)

- Nav label `words` → **`ramblings`** (Gavin's pick over my "logs" suggestion)
- Workbench `The Desk` → **`The Forge`**
- Workbench `Bambu X1C` → **`Printers`** (Bambu H2C + Uniformation GK-Two — H2C is the real model, my mental data was stale)
- Workbench `RC Drift` → **`Dopamine Racing`** (placeholder for upcoming side-project)
- Workbench `Low & Slow` → **`The Bronco`** (Oklahoma Joe Bronco smoker)
- Workbench `Star Citizen` → **`SC Fleet`** (Concierge level)
- Topbar GitHub link points to `https://github.com/gavinmcfall`
- Colophon `mailto:gavin@nerdz.co.nz` (matches his actual email per CLAUDE.md, not the design's `@nerdz.cloud`)
- Logo wired to `/nerdz-logo.svg` (Recraft export — cleaner than the Inkscape one)
- All telemetry uses static demo drift for v1; live wiring (kromgo bridge → real Prometheus) is deferred to Phase 2
- Project status windows show invented placeholder values (`v0.4-rc1`, `412 commits`, etc.) — Phase 2 will wire these to real GitHub via build-time fetch
- Logo animation deferred to Phase 2 (no WebGPU boot sequence yet — just CSS halo + drop-shadows + concentric rings)

</details>

## What's outstanding (Phase 2 work)

1. **Real copy interview** — every line of marketing copy is claude.ai's invention. Sit with Gavin and replace with his actual voice.
2. **Workbench photography / AI art** — 5 placeholder slots. Gavin wants AI art for The Forge and the Homelab context; real photos for Printers, Bronco; Dopamine Racing waiting on its own logo
3. **GitHub status-window wiring** — build-time fetch per repo for version, commits, last push
4. **Live cluster wiring** — extend the existing kromgo bridge in `gavinmcfall-home-ops` to expose JSON for the four-node grid; replace `useNodeStats` simulator with SWR fetch
5. **Logo animation** — WebGPU boot sequence (voxels emissive-dissolve, N body scan, trace stroke-dashoffset current flow); pad pulse + magnetic hover. Re-trace circuit lines in code as separate `<path stroke>` overlays — the SVG paths come baked in.
6. **Subdomain setup** — Cloudflare Pages: nerdz.cloud (this), blog.nerdz.cloud (existing Hugo), cheatsheets.nerdz.cloud (existing MkDocs). DNS in Cloudflare via `CLOUDFLARE_API_TOKEN_NERDZ`.
7. **`/about` and `/projects` deep pages** — explicitly out of scope of this first build per the handoff README

## Log

### 2026-08-26 — Reading guides (/reading): Completed
- New `/reading` area per Gavin's request: interactive EOS/ToD tandem reading-order checklist + fillable PDF. Brainstormed (single anonymous reader per browser — no profiles; area named `/reading` because live reading-stack data joins it later), spec'd, planned, built inline. 4 commits on `main` (`90830f8`..`0767815`).
- **Decisions:** item ids content-derived not positional (progress survives data fixes); localStorage payload versioned `{v:1, checked:[]}`; `useSyncExternalStore` over localStorage (repo's React 19 purity lint forbids setState-in-effect — first draft tripped it); PDF is A4 landscape × 5 columns to match the classic fan sheet; source image's "CH55T/ower of Dawn CH56" typo corrected.
- **Gotchas:** home-ops WSL venv moved — it's `/home/gavin/code/home-ops/.venv` (render_pdf.py's shebang `/home/gavin/home-ops/.venv` is stale); invoke as `wsl -d home-ops` (default distro lacks WeasyPrint). Browser-pane screenshots unavailable this session (pane not displayed) — verified via DOM/JS instead; PDF eyeballed via Ghostscript raster (no poppler on Windows).
- Verified: lint clean on touched files, `npm run build` clean (15 routes incl. `/reading` + dynamic slug), tick/persist/reload/jump/reset/404 all exercised in dev, PDF has 145 AcroForm checkbox fields on 1 page, serves 200.

### 2026-06-21 — Blender Addons field manual: Completed
- New second Blender manual at `/manuals/blender-addons` + PDF `/manuals/blender-addons.pdf`, on branch `feat/manuals-blender-addons` (off `main`). Spec/plan under `docs/superpowers/`.
- Sourced from `E:\Tri-Dimensional\Blender Addons\CHEATSHEET.md`. Second `component`-type sheet (after `blender`).
- Pattern: shared data `src/data/blender-addons.json` (source of truth) → web `src/components/BlenderAddonsManual.tsx` + PDF `scripts/render_pdf.py`. New `printLayout: addons` frontmatter steers a dedicated WeasyPrint renderer + `scripts/print/component-addons.css`. Optional `printLayout` added to the Zod schema in `src/lib/manuals.ts`.
- **Decision/gotcha:** WeasyPrint's CSS grid cannot do full-width spans (`grid-column: 1 / -1`) and its flex wraps two-word titles. The addon PDF renders bands/menu-card/footer as full-width BLOCK elements with each category's cards in their own 2-col grid (`.ad-cat`); `.ad-name` is a block. Clean 2-page A4 portrait. (The web view, browser-grid-capable, keeps a single grid + `1/-1` spans.)
- Verified: `npm run build` clean (3 manuals, 13 routes); both manual pages + both PDFs serve 200; web + PDF visually screenshot-checked.
- Built via subagent-driven-development (5 tasks, each task-reviewed). PDF rendered with a throwaway WSL venv at `/tmp/wpvenv` (home-ops venv not on this machine).

### 2026-05-17 — Initial build: Started
- Branched `feat/hub-redesign` off `main`
- Working from claude.ai design handoff at `C:\Users\gavin\Downloads\Nerdz\design_handoff_nerdz_home`
- User invoked autonomous mode mid-session — no more clarifying questions, make reasonable calls

### 2026-05-17 — Initial build: Completed
- All 11 components + lib/hooks + globals.css + layout + page wired
- TS + ESLint clean
- Full Next build unverifiable in this environment (UNC + lightningcss platform binary). Smoke test deferred to Gavin's dev environment.
- Branch left uncommitted for review.

### 2026-05-17 — Cluster section wired to live kromgo telemetry
- Added `/api/cluster` route fetching 16 kromgo endpoints in parallel (4 summary + 12 per-node)
- Refactored `useNodeStats` (sine simulator) → `useClusterSnapshot` (real fetch every 6s with fallback)
- Added `<ClusterStatusBadge />` for the topbar so "cluster ok/warn/down" reflects real Ready conditions
- Added 8 per-node kromgo queries on home-ops (`node_temp_<name>`, `node_load_<name>`) to mirror the existing per-node power pattern
- Both commits ahead of origin awaiting push

## Phase 3 backlog (deep page + live-everything + blog cohesion)

### /cluster deep page (future, separate route)
Hub stays focused on the 4-node Talos story. Deep page is the full homelab surface.
- All Tier 3-6 kromgo queries we've added: workloads (pods/deployments/statefulsets/daemonsets/jobs/cronjobs/services/namespaces), storage (PVCs/PVs/storageclasses), GitOps (Flux HRs + Kustomizations), media (Plex/Tautulli/Radarr/Sonarr), internet (speedtest), UPS (battery), iGPU (3× stantons), NVIDIA (pyro), SMART
- Citadel section (separate from k8s cluster): `node_power_citadel`, `citadel_temp_inlet_c`, `citadel_temp_exhaust_c`, `citadel_fans_max_rpm`, `citadel_power_state` — Dell PowerEdge via iDRAC IPMI
- Tier 7 sparklines/trends: range queries OR Grafana iframe embedding
- Could iframe-embed 2-3 Grafana panels for the historical trends section

### Known kromgo issues to fix during deep-page work
- **`cluster_power_usage` double-counts** — sums both `network_ups_tools_ups_realpower` UPSes (Kubernetes-Nodes + Citadel-Server). Fix: change query to filter `{ups="Kubernetes-Nodes"}` so the name matches the meaning. Citadel-only power is already exposed as `node_power_citadel`.

### Main page "make it live" backlog
Things still showing placeholder data on the hub:
1. **Ramblings (3 blog posts)** — pull from blog.nerdz.cloud RSS at build time or via `/api/ramblings` route. Hugo emits `index.xml` automatically.
2. **Ramblings (3 cheatsheets)** — placeholder for now per Gavin's earlier call ("we will make some up later"). Eventually pull from cheatsheets.nerdz.cloud (MkDocs sitemap).
3. **Workshop status windows** — every `build / commits / last push / stack` value is invented. Wire to GitHub API per project: SC Bridge (public), Loot Goblin (public — `gavinmcfall/lootgoblin`), Realmstack (private, needs token), Postcraft (private, needs token). Build-time fetch with revalidate makes more sense than runtime.
4. **Hero "Currently building" line** — currently static text. Could derive from "projects with status != planned" but the static answer is fine here.

### Workbench imagery (asset work, not "live")
- The Forge — AI art needed (workspace stylized)
- Printers (Bambu H2C + Uniformation GK-Two) — real photo opportunity
- Dopamine Racing — placeholder until logo + AI art ready
- The Bronco (Oklahoma Joe) — real photo opportunity
- SC Fleet — Concierge level visualization (ship art or fleet manager screenshot)

### Blog cohesion (after main-page-live)
blog.nerdz.cloud is Hugo. Cheatsheets is MkDocs Material. Hub is Next.js. Three different stacks, currently three different visual identities. Cohesion strategies in order of effort:
- **Cheap (CSS theming)**: Build a single design-token CSS file (paper/ink/purple/gold tokens), serve from a shared CDN path, all three sites `@import` it. Hugo theme override + MkDocs `extra.css` + Next.js globals.
- **Medium (shared shell)**: Build a shared `<Topbar />` + `<Colophon />` as static HTML snippets, all three sites include them. Trickier with Hugo (Go templates) than with Next.js (React).
- **Heavy (migrate)**: Move blog to Next.js MDX or to Astro. Lots of work, biggest payoff in visual + interaction consistency.
- Most likely path: cheap CSS-token sharing + matched top-nav strip, blog stays Hugo.

### Logo animation (deferred to Phase 4)
- WebGPU boot sequence: voxel emissive-dissolve + N-body scan + circuit trace stroke-dashoffset current flow
- Pad pulse + magnetic hover
- Re-trace circuit lines as separate `<path stroke>` overlays from the baked SVG silhouette
- Reduced-motion + WebGPU detection fallback to static halo
