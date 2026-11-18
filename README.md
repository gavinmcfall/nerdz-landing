# nerdz-landing

The personal hub at [nerdz.cloud](https://nerdz.cloud): projects, the workbench,
ramblings, live cluster stats, reading guides, manuals and the lab.

## Stack

- [Next.js](https://nextjs.org) (App Router) with React, TypeScript and Tailwind CSS
- Packaged for Cloudflare Workers with
  [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) and deployed with
  `wrangler`
- Colour and type tokens live in `src/app/shell-tokens.css`. The source of truth
  is `nerdz/docs/unified-shell-spec.md`, shared with nerdz-blog.

## Routes

| Path | What it is |
|------|------------|
| `/` | The hub |
| `/about` | About |
| `/projects` | Project cards with build-time GitHub stats |
| `/lab` | Side interests (BBQ, Star Citizen, World of Warcraft) |
| `/lab/warcraft` | WoW armoury: my retail and WoW Forever characters, from the `WOW_ARMORY` KV the nightly [wow-armoury-sync](https://github.com/gavinmcfall/wow-armoury-sync) Worker writes |
| `/lab/warcraft/plan` | WoW Forever plan: levelling order, specs and dual specs, profession coverage. Anyone can view; only the Google logins in the `warcraft:editors` KV key can edit, and edits are saved to `plan:forever` in `WOW_ARMORY` |
| `/manuals` | Field manuals |
| `/reading` | Reading guides and the book club |
| `/agentic-engineering` | How the work is built |
| `/privacy` | Privacy notice |

## Development

```bash
npm install
npm run dev
```

`npm run dev` and `npm run build` first run the generators in `scripts/`
(`npm run gen`), which write the manuals index and project stats into
`src/lib/*.data.json`. Project stats need a `GH_STATS_TOKEN` in the environment.
Without it they render as dashes.

To build and preview the Cloudflare Worker locally:

```bash
npm run cf:build
npm run cf:preview
```

## Deployment

`.github/workflows/deploy.yaml` builds the Worker and runs `wrangler deploy` on
every push to `main`, on manual dispatch, and every 6 hours to refresh project
stats. It needs the `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and
`GH_STATS_TOKEN` repository secrets.

Live cluster stats come from kromgo (`kromgo.nerdz.cloud`) in the home-ops
cluster, read by `src/app/api/cluster/route.ts`.
