# AI image-gen prompts for nerdz.cloud diagrams

Reusable prompts + the **defensive prompt pattern** that made AI image gen actually produce clean technical architecture diagrams for the Lighthouse guide on 2026-06-07.

These are the prompts that worked the FIRST TIME against a recent multimodal model (GPT-4o image gen / Gemini Imagen 3 / similar). Three diagrams: topology (4 tiers), sequence (6 actors, 19 events), auth chain (4 nodes + callout). Every label correct, every connection correct, palette accurate. No text mangling.

---

## Why the defensive style matters

AI image generators are very willing to:
- Paraphrase labels (`"licence-gate proxy"` → `"license gateway prox"`)
- Invent plausible-looking connections that aren't in your spec
- Make up icons or visual flourishes
- Curve edges or use diagonals when you wanted orthogonal
- Ignore palette hex codes and pick "similar" colors

You counter each of those with explicit rules. The pattern that worked:

1. **Strict palette block** — every color named by role, with exact hex codes. Don't write "purple"; write `#a855f7`.
2. **Style rules block** — explicit `ALL connections are 90-degree orthogonal`, `NO curves`, `NO diagonals`, etc. Negative instructions matter more than positive ones.
3. **Content with EXACT labels in quotes** — every node's text in quotes. Add a rule `do not paraphrase, do not invent`.
4. **Numbered, enumerated connections** — list every edge, with label, with style (solid / dashed / gold).
5. **Anti-instructions section at the end** — 5-6 explicit `DO NOT:` bullets covering the common AI failure modes.
6. **Dimensions hint** — give a target width and aspect ratio so the AI plans layout.

The discipline is "be more specific than feels natural; trust the model to render, not to interpret."

---

## When to use this path

**Reach for AI image gen when:**
- Diagram is visually complex (cross-cluster edges, lots of shared resources, bidirectional flows) → mermaid auto-layout will fail
- Diagram is stable (it won't change every week) → raster output cost is acceptable
- Visual polish matters → AI gen can produce gallery-grade output mermaid can't
- You've already tried mermaid + dagre + step routing and it still looks bad
- Hand-authored SVG would take longer than iterating prompts

**Stick with mermaid when:**
- Diagram is simple (linear flow, 3-5 nodes) → mermaid handles it cleanly
- Authors will iterate on it → text source of truth survives
- Content needs to be portable (Hugo blog + Fumadocs guide + PDF) → mermaid source travels

---

## The velvet palette block (copy into prompts)

```
STRICT PALETTE (use these exact hex codes — no variations):
- Background: #0a0712 (deep near-black with violet undertone)
- Subgraph backdrop fill: #14101e with dashed #6A0DAD border, slight glow
- Node fill: #1a1525
- Node border (default): #6A0DAD (true purple)
- Node border (emphasized): #a855f7 (lit-up purple — sparing use, only for "load-bearing" nodes)
- Node title text: #f1e8d6 (warm cream)
- Node body text: #d8cfb9
- Italic mute text: #a39a85
- Solid edges (primary/request flow): #a855f7
- Solid edges (shared resource, no arrowhead): #c9a86e (warm gold)
- Dashed edges (lazy/optional flow): #a855f7 dashed
- Edge labels: #c9a86e italic
- Font: monospace (JetBrains Mono / IBM Plex Mono vibe)
```

---

## The three prompts that worked (Lighthouse architecture-and-topology)

### Diagram 1 — Topology (the hard one)

```
Generate a clean technical architecture diagram in a dark "velvet" aesthetic, similar to a polished developer documentation site (e.g. fumadocs.dev or vercel docs).

STRICT PALETTE (use these exact hex codes — no variations):
- Background: #0a0712 (deep near-black with violet undertone)
- Subgraph backdrop fill: #14101e with dashed #6A0DAD border, slight glow
- Node fill: #1a1525
- Node border: #6A0DAD (true purple)
- Emphasized node border: #a855f7 (lit-up purple — use only for "Gateway + OIDC", which is "the only door")
- Node title: #f1e8d6 (warm cream)
- Node body text: #d8cfb9
- Italic mute text: #a39a85
- Solid edges (request flow): #a855f7
- Solid edges (shared storage, no arrowhead): #c9a86e (warm gold)
- Dashed edges (lazy pulls): #a855f7 dashed
- Edge labels: #c9a86e italic
- Font: monospace (JetBrains Mono / IBM Plex Mono vibe)

STYLE RULES:
- ALL connections are 90-degree orthogonal (right-angle bends only)
- NO curves, NO diagonal lines, NO bezier
- Rounded rectangle nodes with thin 1.5px borders
- "RWX storage" is drawn as a cylinder (database shape)
- Subgraph backdrops are dashed-border rounded rectangles, slightly elevated fill
- Layout direction: top to bottom

CONTENT — every label is exact, do not paraphrase, do not invent:

TIER 1 — subgraph "Family":
  Node: "Family member" / subtext "(browser)"

TIER 2 — standalone node between Family and Cluster (emphasized border):
  Node: "Gateway + OIDC provider" / subtext "verifies identity, injects JWT" / italic mute "— the only door"

TIER 3 — subgraph "Always-on cluster (no GPUs)" containing 4 elements in this layout:
  Top row left-to-right:
    - Node: "licence-gate proxy" / subtext "isolation · licence" / "role · tier"
    - Node: "ComfyUI master" / subtext "CPU, orchestrator-only" / italic mute "— never renders"
    - Node: "model-serve" / subtext "token-auth file" / "server"
  Center bottom (cylinder):
    - "RWX storage" / subtext "models · output · workflows"

TIER 4 — subgraph "Remote GPU workers (Windows/WSL2, sleep-by-default)" containing:
  - Node: "heavy worker" / subtext "16 GB VRAM" / "ComfyUI + Distributed"
  - Node: "light worker" / subtext "8 GB VRAM" / "ComfyUI + Distributed"

CONNECTIONS — every one, exact labels:
1. Family member → Gateway (solid purple)
2. Gateway → licence-gate (solid purple, entering cluster from above)
3. licence-gate → ComfyUI master (solid purple, label: "sanitized request" — gold italic)
4. ComfyUI master → heavy worker (solid purple, label "/distributed/queue dispatch by tier" — gold italic)
5. ComfyUI master → light worker (solid purple, same dispatch logical edge)
6. heavy worker → ComfyUI master (solid purple, label "collected result" — gold italic, route OFFSET from #4 to avoid overlap)
7. ComfyUI master → RWX storage cylinder (solid purple, label "SaveImage → /output/user-uuid/" — gold italic)
8. licence-gate to RWX storage (solid GOLD, no arrowhead, label "shares" — gold italic)
9. model-serve to RWX storage (solid GOLD, no arrowhead, label "shares" — gold italic)
10. heavy worker → model-serve (dashed purple, label "pull models on first use" — gold italic)
11. light worker → model-serve (dashed purple, no label — same as #10)

Include a legend at the bottom (gold italic 10px):
  "—— request / dispatch    —— shares storage    ╌╌ pull on first use"

Width ~1200px, aspect ~4:3.

DO NOT:
- Invent any node or connection not listed
- Paraphrase any label
- Add icons, gradients, or visual flourishes beyond the colors specified
- Use curves or diagonal lines
- Add a title — just the diagram
```

### Diagram 2 — Render sequence

```
Generate a sequence diagram in a dark "velvet" aesthetic, similar to a polished developer documentation site.

STRICT PALETTE (exact hex):
- Background: #0a0712
- Actor head fill: #1a1525 / border: #6A0DAD (1.5px)
- Lifelines: dashed #6A0DAD 1px, opacity 0.55
- Activations (skinny vertical bars on lifelines): #2a2030 fill, #a855f7 border
- Messages (arrows): #a855f7 solid 1.4px, with filled arrowheads
- Self-message loops: same color, smaller
- Note boxes: #14101e fill, #c9a86e border, italic gold text
- Actor text: #f1e8d6 title (13px bold), #d8cfb9 subtext (11px)
- Message labels: #d8cfb9 (11px, italic optional)
- Font: monospace

STYLE:
- 6 actors in fixed columns at top (head boxes)
- Vertical lifelines below each actor
- Time flows top-to-bottom
- Self-messages are small right-loop arrows
- Notes are centered boxes spanning the licence-gate lifeline area
- Generous vertical spacing between messages (~38-42px each)

ACTORS (left to right, 6 columns):
1. "U — Family member" / subtext "(browser)"
2. "G — Gateway" / subtext "(OIDC)"
3. "L — licence-gate"
4. "M — ComfyUI master" / subtext "(CPU)"
5. "W — GPU worker" / subtext "(WSL2)"
6. "S — RWX output"

MESSAGES (in order, every one exact):
1. U → G: "POST /distributed/queue (workflow)"
2. G → G (self loop): "verify OIDC, inject JWT (sub + groups)"
3. G → L: "forward request + JWT"
4. L → L (self): "decode JWT → identity + groups"
5. L → L (self): "parse workflow against §7 node allowlist (default-deny)"
6. L → L (self): "resolve every model ref → registry (licence + requires_group)"
7. NOTE over L (centered yellow-bordered box): "reject if: unallowlisted node · non-commercial model on a commercial job · model's group not held · no worker fits the tier"
8. L → L (self): "rewrite SaveImage filename_prefix → user-uuid/..."
9. L → L (self): "filter enabled_worker_ids by tier fit"
10. L → M: "forward sanitized request"
11. M → W: "dispatch render (DistributedCollector/Seed)"
12. W → M: "return image batch"
13. M → S: "SaveImage → /output/user-uuid/"
14. (horizontal dashed separator with italic mute "— later: retrieve —")
15. U → G: "GET /view?... (later)"
16. G → L: "forward"
17. L → L (self): "scope read to user-uuid bucket"
18. NOTE over L: "identical 404 for not-yours vs absent — no existence side-channel"
19. L → U: "only this user's images"

Width ~1200px, height enough to fit 19 events with breathing room (~900px).

DO NOT:
- Invent any actor, message, or note not listed
- Paraphrase any label
- Use curves
- Number the rows — sequence diagrams don't need numbered events (Gavin: "the numbers make it busy")
```

### Diagram 3 — Auth chain (simplest)

```
Generate a horizontal data-flow architecture diagram in a dark "velvet" aesthetic.

STRICT PALETTE:
- Background: #0a0712
- Node fill: #1a1525, border #6A0DAD (1.5px)
- Emphasized border (for Gateway only): #a855f7
- Callout box: #14101e fill, dashed border #a39a85
- Node title: #f1e8d6 / body: #d8cfb9
- Edges: #a855f7 solid with arrowhead
- Dashed callout edge: #a39a85 dashed
- Edge labels: #c9a86e italic
- Font: monospace

LAYOUT: 4 boxes in a horizontal row, left to right.

NODES (left to right):
1. "Browser"
2. (emphasized border) "Gateway" / "VERIFIES token," / "injects JWT"
3. "licence-gate" / "DECODES only," / "does NOT verify"
4. "ComfyUI master :8188"

CONNECTIONS:
- Browser → Gateway (solid, label "OIDC login")
- Gateway → licence-gate (solid, label "verified JWT (sub + groups)")
- licence-gate → ComfyUI master (solid, no label)

CALLOUT (below licence-gate, dashed border):
"NetworkPolicy" / ":8000 reachable ONLY from" / "gateway + worker subnet"
Connect via dashed muted arrow upward to licence-gate.

90-degree orthogonal lines only. No curves. Width ~1200px, height ~280px.
```

---

## Adapting these prompts for new diagrams

Treat the three above as templates. For a new diagram:

1. **Keep the palette block verbatim** (or update the hex codes if a different palette).
2. **Keep the style-rules block verbatim** — those are the load-bearing anti-curve, anti-diagonal, exact-text rules.
3. **Replace the content section** — enumerate your tiers/subgraphs/nodes, every label in quotes.
4. **Replace the connections section** — number every edge, with label and style (solid purple = primary, solid gold = shared, dashed = lazy).
5. **Adjust the anti-instructions block** to call out failure modes specific to your diagram type (e.g. for sequence diagrams: "do not number the rows", "do not change the actor order").
6. **Adjust dimensions** — wider for horizontal flows, taller for sequence diagrams with lots of events.

---

## Tools tested

Worked verified 2026-06-07:
- GPT-4o image generation (via ChatGPT)
- Gemini Imagen 3 (via Gemini app)

Tools that probably also work with the same prompts (untested but well-positioned):
- Claude with image-gen (if/when available)
- Midjourney v6+ with `--niji` or default
- Recraft, Ideogram, Adobe Firefly

Tools that probably DON'T work well:
- Stable Diffusion (any flavor) — text rendering is historically weak
- DALL-E 2 (DALL-E 3 OK)
- Anything older than ~Q3 2024

---

## File locations after running

- Output: PNGs, typically 1-1.5 MB each at the dimensions in the prompts
- Drop into `src/content/<guide>/<chapter>/_assets/` next to the MDX file
- Reference in MDX with standard markdown: `![alt text](./_assets/<name>.png)`
- Next picks them up via the static asset pipeline (`_next/static/media/<name>.<hash>.png`)

Velvet palette is hardcoded into the PNG — they'll look right in dark mode but slightly off in light mode. To support light mode, run a second pass with the inverted palette and use `<picture>` with `prefers-color-scheme` media queries.
