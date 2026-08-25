---
description: "Deploy nerdz-landing only by pushing main to GitHub — never run cf:deploy from a Windows machine."
tags:
  - "deploy"
  - "cloudflare"
  - "opennext"
  - "wrangler"
  - "ci"
  - "windows"
  - "cf:deploy"
  - "workers"
category: rule
relevance: "file:///.github/workflows/deploy.yaml;file:///wrangler.jsonc;file:///package.json;file:///open-next.config.ts"
verification: "file:///.github/workflows/deploy.yaml"
ttl: 180
verified:
  date: "2026-08-26"
  commit: "21e43ddd1f0f"
---

## Capsule: DeployViaCiOnly

**Invariant**
Deploy nerdz-landing only by pushing main to GitHub — never run cf:deploy from a Windows machine.

**Why**
The @opennextjs/cloudflare worker bundle mis-builds on Windows: a locally-built deploy on 2026-08-26 returned 500 on every route with "TypeError: components.ComponentMod.handler is not a function" while the same lockfile built fine in CI. .github/workflows/deploy.yaml deploys on push to main (and on a 6h cron to refresh /projects stats), building on Linux. Recovery from a bad local deploy: push main (CI redeploys good build) or wrangler rollback to the previous version id.

**Example**
npm run cf:deploy from G:\code\nerdz\nerdz-landing (Windows) → worker uploads fine but every SSR route 500s; git push origin main → CI deploy restores the site in ~1 minute.

**Depth**
- **STUB** - add distinctions, trade-offs, and boundaries.
