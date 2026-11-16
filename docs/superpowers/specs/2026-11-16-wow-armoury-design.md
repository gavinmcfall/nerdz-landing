# WoW Armoury on nerdz.cloud: design

**Date:** 2026-11-16
**Status:** approved by Gavin, 2026-11-16
**Repos:** `nerdz-landing` (the pages) and `wow-armoury-sync` (the data, at github.com/gavinmcfall/wow-armoury-sync)

## Intent

Gavin wants his World of Warcraft characters on his own site, laid out like Blizzard's character Armory. The reference is Cònsecrator's page on Barthilas:

```
https://worldofwarcraft.blizzard.com/en-us/worldsoul/us/armory/character/barthilas/c%C3%B2nsecrator
```

It should have the same tabs and the same layout, in nerdz.cloud's own colours, and it should update nightly. It covers both his retail characters and his WoW Forever characters. Every character page must make clear which game the character is from:

- **Retail:** which realm.
- **Forever:** which play style.

The page joins the existing hobby pages in the Lab (BBQ, Star Citizen). It's a showcase: something he enjoys looking at and can share, not a tool.

## Goals

- A roster at `/lab/warcraft` listing every tracked character, split into Retail and Forever.
- A page for each character with the Armory's six tabs: **Character, Achievements, Collections, Dungeons & Raids, Player vs Player, Reputation**.
- Each tab has its own URL, so tabs can be linked and shared.
- A game badge on every character page and roster card: "Retail · Barthilas" or "Forever · Normal". The Forever value is the API's `ruleset.name`; see below.
- The data refreshes nightly, through the existing `wow-armoury-sync` Worker.
- Pages load fast: each page reads one small, ready-to-render KV value, never megabytes of raw API data.
- It works in the site's dark and light themes, and at phone width.

## Non-goals (for now)

- **Live data.** Nightly is the requirement.
- **Talent trees.** The Armory's "View talent details" pages are left out. We show the specs, which talent loadout is active, and the hero talent.
- **Character image export, transmog collections, Mythic+ seasonal history, and search.**
- **Other people's characters.** Only the characters listed in `wow-armoury-sync/src/characters.js` appear.

## Anti-goals

- **It must not look like a Blizzard page.** Don't use Blizzard's logo, page art, background images or fonts. Use the site's palette, type and components. The only Blizzard-supplied images are the ones the API hands out: character renders, and item, mount and pet icons.
- **The site must never call the Battle.net API.** No Blizzard credentials live in nerdz-landing.
- **A failed sync must never blank a page.** The last good data stays, with an "as of" date.

## Constraints and facts already established

These were verified against the live API on 2026-11-16.

- **Every tab has data in both games.** For both Cònsecrator (retail) and Recurve (Forever), all of these endpoints return 200:
  - `achievements`, `achievements/statistics`
  - `collections/{mounts,pets,toys,heirlooms}`
  - `encounters/{raids,dungeons}`
  - `mythic-keystone-profile`, `pvp-summary`, `titles`, `appearance`
  - Forever also returns `hunter-pets`.
- **Forever has no realm.** Its profile carries `ruleset: { id: 2, name: "Normal" }`, which is the play style. Recurve is on the PvE style, and the API calls it "Normal". The ruleset index lists ids 1, 2, 3 and 15. **Show `ruleset.name` exactly as the API gives it.** Don't map ids to labels.
- **Forever characters appear in the API only from level 10, after a logout.** Below that, the API returns 404.
- **Raw sizes are large.** For Cònsecrator: achievements are 909 KB, transmogs 639 KB, pets 118 KB, raids 70 KB, and reputations cover 137 factions. That is why the sync shapes the data.
- **Workers limits (paid plan):**
  - 10,000 subrequests per cron run.
  - 15 minutes of wall time for a cron run.
  - KV values up to 25 MiB.
  - One write per second to the same key.
- **Same Cloudflare account:** checked on 2026-11-16 with the nerdz account token. The site's Worker, its `READING_SYNC` namespace, and `WOW_ARMORY` all sit in the nerdz account (`4214879e…`). So the site reads `WOW_ARMORY` through an ordinary KV binding in its `wrangler.jsonc`, and no read token is needed.
- **The site** (nerdz-landing) is Next.js 16 on Cloudflare Workers through OpenNext. It already reads KV with `getCloudflareContext({ async: true }).env.<BINDING>`; see `src/lib/bookclub-server.ts`. Lab sub-pages are linked from cards in `src/components/Workbench.tsx`. Colours come from `src/app/shell-tokens.css`.

## Approaches considered

1. **The sync shapes the data, and the site just displays it. (Chosen.)** Each night the sync:
   - fetches everything,
   - joins it with Blizzard's reference data (reputation expansions, achievement category totals, mount and pet names and icons), caching that reference data in KV,
   - writes one small "view" per character per tab.

   The site reads one KV value per page. This puts more work in the sync, but pages are fast and the site stays simple.
2. **The sync stores raw responses, and the site shapes them per request.** This is a simpler sync, but every page view parses up to 2 MB and repeats the same work. Rejected.
3. **The site calls Blizzard live.** This would put Blizzard credentials in the site, and the requirement is nightly updates anyway. Rejected.

Gavin picked approach 1.

## Design

### Routes (nerdz-landing)

| Route | Shows |
| --- | --- |
| `/lab/warcraft` | The roster. Retail and Forever sections, one card per character. |
| `/lab/warcraft/retail/{realm}/{name}` | Character tab (retail) |
| `/lab/warcraft/forever/{name}-{surname}` | Character tab (Forever) |
| `…/achievements` | Achievements tab |
| `…/collections` and `…/collections/{mounts,pets,toys,heirlooms}` | Collections tab, opening on pets as the Armory does |
| `…/pve` | Dungeons & Raids tab |
| `…/pvp` | Player vs Player tab |
| `…/reputation` | Reputation tab |

**URL segments:** realm and name are the lowercase forms the API uses, with accents kept. For example, `cònsecrator` is URL-encoded as `c%C3%B2nsecrator`, the same as on the Armory. These URLs come from the sync's character keys, so the site never builds names itself.

**Unknown characters:** an unknown character or tab returns the site's 404.

Add a "World of Warcraft" card to `Workbench.tsx` that links to `/lab/warcraft`.

### Page layout

Each character page has a shared header and tab bar, then the tab's content:

```
┌──────────────────────────────────────────────────────────────┐
│ Cònsecrator                    ⛉ 11,940   ⚔ 81 ilvl          │
│ Vengeance Incarnate                                          │
│ 80 Blood Elf Retribution Paladin  ‹Big Chur›                 │
│ [Horde] [Retail · Barthilas]           updated 16 Nov, 3:17am│
├──────────────────────────────────────────────────────────────┤
│ CHARACTER  ACHIEVEMENTS  COLLECTIONS  DUNGEONS & RAIDS  PVP  REPUTATION │
└──────────────────────────────────────────────────────────────┘
```

- **Header contents:** the title, achievement points and item level. Then level, race, spec and class, and the guild. Then a faction badge, the game badge, and when the data was last updated.
- **Faction and game badges:** plain text pills in site colours. The faction pill gets a red tint for Horde and a blue tint for Alliance. No Blizzard crest artwork.

**Character tab:**

```
 [icon] Head      80                        Hands     86 [icon]
 [icon] Neck      78                        Waist     83 [icon]
 [icon] Shoulder  83     ┌──────────────┐   Legs      83 [icon]
 [icon] Back      86     │  character   │   Feet      79 [icon]
 [icon] Chest     79     │   render     │   Ring      83 [icon]
 [icon] Shirt            │  (main-raw)  │   Ring      80 [icon]
 [icon] Tabard           │              │   Trinket   80 [icon]
 [icon] Wrist     86     └──────────────┘   Trinket   80 [icon]
                  [icon] Main hand 80   [icon] Off hand
 ── stats strip: Health · Power · primary stat · Stamina · Crit · Haste · Mastery · Versatility
 ── specialisations: 3 cards (or 4 for Druid), active one highlighted, with hero talent and PvP talents
 ── summary panels: Mythic+ (retail only) · Raid progression · PvP
```

- **Item names** are coloured by item quality, using the game's standard quality colours (poor, common, uncommon, rare, epic, legendary, artifact, heirloom). These carry meaning, so they're kept even though they're not site colours. They must stay readable in the light theme, so each needs a light-theme variant.
- **Item tooltips:** hovering an item, or focusing it with the keyboard, shows a tooltip built from the stored data: name, item level, binding, slot and type, armour, stats, and any enchant, gems or set bonus the equipment response gives. No outside tooltip scripts.
- **Empty slots** show an empty frame, as the Armory does.

**Other tabs** follow the Armory's structure:

- **Achievements:** a grid of category tiles, each with a progress ring (% complete) and points earned. Clicking a category lists its achievements, completed and not completed.
- **Collections:** sub-tabs for Pets, Mounts, Toys and Heirlooms. Each shows a count (for example "256 unique pets") and a paged or scrolling grid of icons with names.
- **Dungeons & Raids:** retail shows Mythic+ for the current season, then raids grouped by expansion, with kills per difficulty (LFR, Normal, Heroic, Mythic). Forever shows the dungeons and raids its API returns, and hides the Mythic+ section.
- **Player vs Player:** honour level, honourable kills, and a card per bracket (2v2, 3v3, rated battlegrounds, Solo Shuffle, Blitz) with rating, or "no rating" where empty.
- **Reputation:** factions grouped under expansion headings, newest first, each with a progress bar and its standing ("Renown 8", "Exalted", "Acquaintance"). Include a filter box like the Armory's.

### Roster

- **One card per character:** a small render (the `avatar` or `inset` asset), name, level, race and class, spec, item level, and the game badge.
- **Sorting:** level, then item level, both descending.
- **Not yet listed:** a character with status `not-listed` gets a muted card saying "Appears in Blizzard's API at level 10". It has no link.
- **Sync errors:** a character with status `error` shows its last good data, with a small "data from {date}" note.

### Data: what the sync writes

The sync keeps its current behaviour (index, error handling, icon cache) and changes what it stores per character.

**`wow-armoury-sync` stays a general tool** (Gavin's decision). Anyone can run it to feed their own armoury page, so:

- **The views are its public data format, not nerdz.cloud's private one.** They describe the Armory's tabs and contain nothing specific to nerdz.cloud: no site URLs, no colours, no display text written for this site.
- **The README's "What gets stored" and "Reading the data" sections are rewritten around the views.** That includes an example of each view.
- **Releases get version numbers.** This change is released as v2.0.0, with a short "upgrading from v1" note: the raw `character:` records are removed and replaced by views. It's a breaking change, but the repo has only just gone public, so nobody depends on v1.

The sync's README gets a new section documenting this KV contract. The site's TypeScript types are written against that contract, and both sides check `schemaVersion`.

| Key | Contents |
| --- | --- |
| `index` | As now, plus `schemaVersion`, the path segments the site needs for the URL, `title`, `guild`, `achievementPoints`, `realm` (retail) or `ruleset` (Forever), and the roster render URL |
| `view:v{n}:{key}:character` (all view keys carry the version; see "Schema changes" below) | The header, the gear with everything the tooltip needs (icon URL resolved), stats, specs, and the Mythic+ / raid / PvP summaries |
| `view:{key}:achievements` | Totals, plus per category: name, points, completed / total, and its achievements (name, icon, points, completed date) |
| `view:{key}:collections` | Mounts, pets, toys and heirlooms, each as `{ id, name, icon }` with counts |
| `view:{key}:pve` | Mythic+ season summary (retail) and raids grouped by expansion with kills per difficulty |
| `view:{key}:pvp` | Honour level, honourable kills, and the brackets |
| `view:{key}:reputation` | Factions grouped by expansion, with standing names and progress |
| `ref:{namespace}:…` | Cached reference data: achievement categories and totals, reputation faction-to-expansion map, mount, pet and toy names and icons, item icons (the existing `icon:` keys move here) |

- **Old keys:** the existing `character:{key}` records are deleted once the views replace them. Don't keep raw copies.
- **Budget:** the sync must stay under 10,000 subrequests per run. Reference lookups are cached forever, so after the first few nights almost everything is a cache hit. The sync caps new reference lookups per run, at a number the builder picks. If it hits the cap, it stores what it has and fills the gaps on following nights. In a gap, the site shows the item without an icon rather than failing.
- **Schema changes** (my call, so a page never goes blank when the two repos deploy at different times):
  - View keys carry the schema version: `view:v{n}:{key}:{tab}`.
  - When the sync moves to version n+1, it keeps writing version n views alongside the new ones until the site has shipped support for n+1. Only then is version n dropped, in a later sync release.
  - The site reads the newest version it understands and falls back to the one before.
  - If neither version exists, the page shows the tab's "no data yet" state, not an error.
- **Failures:** each view is written only when its own data fetched cleanly. If the achievements call fails, the old achievements view stays, and so do the other views.

### Site: how pages read data

- **Server components** read KV directly. The roster reads `index`, and a tab reads `index` (for the header) plus its own view.
- **No client-side fetching of the data.** Interactive parts are small client components: the item tooltip, the reputation filter, collection paging, and achievement category expansion.
- **Caching:** pages render per request, because data changes nightly and KV reads are cheap. The builder may add caching if it's simple.
- **Images:** character renders and icons load straight from Blizzard's render CDN URLs given by the API.

### Look and feel

- **Colours, type and layout** come from the site's tokens: dark `paper`, `ink`, purple and glow accents, gold for category labels, IBM Plex Sans and JetBrains Mono, with `--radius` corners. Use the existing `section` / `frame` / `SectionHead` structure so it sits in the site's shell like the other Lab pages.
- **Tab bar:** gold labels, with the active tab marked in the site's accent colour (the Armory uses a gold underline).
- **Not in site colours:** only item quality colours, faction tints, and the images from the API.
- **Light theme:** every view must be checked in the light theme (`data-theme="light"`).
- **Phone width:** the gear columns stack above and below the render, and the tab bar scrolls sideways.

## Build order

Each step ships on its own.

1. **Sync v2 foundation, Character tab and roster.**
   - Sync: `schemaVersion`, the richer `index`, `view:{key}:character`, and the `ref:` cache.
   - Site: `/lab/warcraft` roster, character header and tab bar, Character tab, and the Workbench card.
   - Until the other tabs ship, they show "coming soon". They are not hidden, so the page already looks like the Armory.
2. **Reputation**
3. **Achievements**
4. **Collections**
5. **Dungeons & Raids**
6. **Player vs Player**

## Testing

- **Sync:** unit tests for every view builder, against trimmed real API responses saved as fixtures. Include one retail fixture and one Forever fixture, and cover not-listed, errors, partial failure and the reference-lookup cap.
- **Real data check:** after each step, run the sync locally against the real API and read the KV result.
- **Site:** `npm run build` must pass. Check each page in a browser in both themes and at phone width, for one retail and one Forever character.

## Left to the builder

- Component structure, file names and CSS organisation inside nerdz-landing, following the site's existing conventions.
- The size of the per-run reference-lookup cap.
- Exact field lists inside each view, as long as the pages above can be drawn from them.
- Whether collections page or scroll.
- Small visual details not fixed above.
