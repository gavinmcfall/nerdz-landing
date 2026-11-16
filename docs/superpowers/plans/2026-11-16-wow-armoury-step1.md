# WoW Armoury, step 1: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the roster at `/lab/warcraft` and the Character tab for every tracked character. The other five tabs show "coming soon". The data comes from sync v2, which writes ready-to-render views to KV.

**Architecture:**

- `wow-armoury-sync` (plain JS Worker, `node:test`) changes from storing raw API records to storing:
  - a versioned index;
  - one `view:v1:{key}:character` value per character;
  - a `ref:` cache of reference data, with a cap on new lookups per run.
- `nerdz-landing` (Next.js 16 on Workers through OpenNext) binds the same KV namespace and renders server components from it.
- The only client components are the item tooltip slots.

**Tech stack:**

- **Sync:** Cloudflare Workers, Workers KV, Battle.net profile and game data APIs, Node 24 `node:test`.
- **Site:** Next.js 16 App Router, React 19, TypeScript, plain CSS on the site tokens.

**Spec:** `docs/superpowers/specs/2026-11-16-wow-armoury-design.md` (approved 2026-11-16). The approved mockup is https://claude.ai/artifact/Dnu1W7N5pmSCzs7gMczKJ2 (roster, Cònsecrator, Recurve). Match its layout.

## Global Constraints

- **Repos:** sync at `G:\code\nerdz\wow-armoury-sync`; site at `G:\code\nerdz\nerdz-landing`. Only `git add` files you changed; another session works in nerdz-landing.
- **Commit trailers on every commit:**
  - `Assisted-by: Claude Code (claude-opus-5-5)`
  - `Agentically-Engineered: https://nerdz.cloud/agentic-engineering`
  - `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **KV namespace:** `WOW_ARMORY`, id `3f1c3a246ead46b6a6bddeb7db8b8455`, in the nerdz account (`4214879ee537a4840de659aafb7bf201`).
- **Wrangler token (PowerShell):** `$env:CLOUDFLARE_API_TOKEN = $env:CLOUDFLARE_API_TOKEN_NERDZ`.
- **Schema version:** `SCHEMA_VERSION = 1`.
- **View key format:** `view:v{n}:{key}:{tab}`. This step writes only the `character` tab.
- **Index rules:** the `index` key holds `schemaVersion`. Changes to the index shape are additive only, so the index key itself is never versioned.
- **Sync is a general tool:** views contain no nerdz.cloud URLs, colours or site copy. Display strings come from the API, or from neutral formatting such as `"18%"`.
- **The site never calls Battle.net.** No Blizzard credentials go into nerdz-landing.
- **A failed fetch never blanks a page:** keep the previous view and summary, and mark the summary `status: "error"`.
- **Forever play style:** show `ruleset.name` exactly as given, e.g. "Normal".
- **Blizzard-supplied images only:** no Blizzard logos or crests. Item quality colours and faction tints are the only non-site colours.
- **Light theme** (`data-theme="light"`) and phone width must both work.
- **Item quality colours:** dark / light pairs, as CSS variables in `warcraft.css`:

  | Quality | Dark | Light |
  | --- | --- | --- |
  | poor | `#9d9d9d` | `#6b6b6b` |
  | common | `var(--ink)` | `var(--ink)` |
  | uncommon | `#3ee62a` | `#1b7a0b` |
  | rare | `#4aa3ff` | `#0a5cb8` |
  | epic | `#c27cf7` | `#7a26b8` |
  | legendary | `#ff9433` | `#a85200` |
  | artifact | `#e6cc80` | `#7a6420` |
  | heirloom | `#00ccff` | `#00739a` |

- **Class colours** are used only for the roster card stripe and the class word: Paladin `#F48CBA`, Demon Hunter `#A330C9`, Hunter `#AAD372`, Warlock `#8788EE`, Shaman `#0070DD`, Druid `#FF7C0A`, Evoker `#33937F`, Mage `#3FC7EB`, Warrior `#C69B6D`, Priest `#FFFFFF`, Rogue `#FFF468`, Death Knight `#C41E3A`, Monk `#00FF98`.
- **Times** are shown in `Pacific/Auckland`.

## Review Focus

1. **A character whose last sync failed** (`status: "error"`) still shows its last good page, with a "data from {date}" note. Covered in Task 4 (sync keeps the view) and Task 8 (header note).
2. **A URL for a character or tab that isn't tracked** returns the site's 404, not a crash. This includes `/lab/warcraft/retail/barthilas/nobody` and `/lab/warcraft/forever/recurve-ravenholt/talents`. Covered in Task 6 (`resolveCharacterPath` tests) and Task 8.
3. **Accented names in the URL** resolve whether the browser sends them encoded (`c%C3%B2nsecrator`) or decoded (`cònsecrator`). Covered in Task 6.
4. **Items without an icon** (the lookup cap was hit, or the Forever static item returned 404) render an empty-framed slot, and the rest of the gear still renders. Covered in Task 1 (cap returns null), Task 2 (`icon: null`) and Task 9.
5. **The site deploys before the sync has written v1 data** (no `index`, or an old index without `schemaVersion`). The roster shows "No characters synced yet" instead of throwing. Covered in Task 7.

---

## Part A: `wow-armoury-sync` v2

### Task 1: Reference-data cache with a per-run lookup cap

**Files:**
- Create: `src/refs.js`
- Test: `test/refs.test.js`

**Interfaces:**
- Consumes: `BlizzardClient#get(path, namespace) → {status, data}` (existing).
- Produces: `createRefs({ client, kv, maxNewLookups = 2000 })`, which returns:
  - `itemIcon(staticNamespace, itemId) → Promise<string|null>`, keyed `ref:{ns}:item-icon:{id}`, stored as a plain string.
  - `classSpecs(staticNamespace, classId) → Promise<string[]|null>`, keyed `ref:{ns}:class-specs:{classId}`, stored as JSON. It holds spec names in API order, from `/data/wow/playable-class/{id}` → `specializations[].name`.
  - `stats() → { hits, fetched, skipped }`.

- [ ] **Step 1: Write failing tests** in `test/refs.test.js`, using a fake KV and a fake fetch like `test/sync.test.js`:
  - `itemIcon returns the cached url without an API call`: KV holds `ref:static-us:item-icon:100`. Assert the URL comes back and the fetch log has no `/data/wow/media/item/100`.
  - `itemIcon fetches, caches and returns the icon asset on a miss`. Assert KV now holds the URL.
  - `itemIcon returns null and caches nothing when the API 404s`.
  - `classSpecs caches the spec names for a class`: `/data/wow/playable-class/2` gives `{specializations:[{name:"Holy"},{name:"Protection"},{name:"Retribution"}]}`. Assert `["Holy","Protection","Retribution"]` and the KV JSON.
  - `stops fetching new references after maxNewLookups`: with `maxNewLookups: 1`, two different uncached icons. The first resolves, the second returns `null`. Assert `stats()` is `{hits:0, fetched:1, skipped:1}`.
  - `cached hits do not count against the cap`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, `Cannot find module '../src/refs.js'`.
- [ ] **Step 3: Implement `createRefs`** in `src/refs.js`. One counter is shared by both lookup kinds; a 404 counts as a fetch.
- [ ] **Step 4: Run** `npm test`. Expected: all refs tests PASS, and the existing sync tests are unchanged.
- [ ] **Step 5: Commit**: `git add src/refs.js test/refs.test.js`, message "Add reference-data cache with a per-run lookup cap".

### Task 2: Character view builder

**Files:**
- Create: `scripts/capture-fixtures.mjs`, `test/fixtures/retail-consecrator.json`, `test/fixtures/forever-recurve.json`, `src/views/character.js`
- Test: `test/character-view.test.js`

**Interfaces:**
- Consumes: raw API JSON, with each section `null` when its fetch was not 200.
- Produces: `buildCharacterView({ game, fetchedAt, profile, equipment, statistics, specializations, media, pvp, mythic, raids, itemIcons, classSpecs }) → CharacterView`.
  - `itemIcons` is `{ [itemId]: url }`.
  - `classSpecs` is `string[]|null`.

The `CharacterView` shape (`schemaVersion: 1`):

```js
{
  schemaVersion: 1, game: "retail" | "forever", fetchedAt,
  render: string | null,                       // media asset "main-raw"
  equipment: [{
    slot,            // API slot.type, e.g. "HEAD", "FINGER_1", "RANGED", "AMMO"
    slotName, name, quality,                     // quality = quality.type, e.g. "EPIC"
    itemLevel, icon,                             // icon: string | null
    binding, inventoryType, subclass,            // display names; subclass null when is_subclass_hidden
    armor,                                       // armor.display.display_string | null
    stats: [{ text, negated }],                  // display_string; negated = is_negated === true
    enchantments: string[], sockets: string[],   // display_string values
    spells: string[],                            // spells[].description
    set: string | null,                          // set.display_string
    weapon: { damage, speed, dps } | null,       // display strings
    requirement: string | null,                  // requirements.level.display_string
    description: string | null, nameDescription: string | null,
  }],
  stats: [{ label, value }],
  specs: [{ name, active, heroTalent, pvpTalents: string[], spentPoints }],
  mythicPlus: { rating: number | null } | null,  // null for Forever
  raids: { expansion, instances: [{ name, modes: [{ difficulty, completed, total }] }] } | null,
  pvp: { honorLevel: number | null, honorableKills: number, rank: number | null },
}
```

- **`stats`, retail:**
  - Health, then the power type name.
  - The highest of Strength, Agility and Intellect (effective), then Stamina.
  - "Critical strike" `melee_crit.value`, "Haste" `melee_haste.value`, "Mastery" `mastery.value` and "Versatility" `versatility_damage_done_bonus`, each rounded to a whole percent, e.g. `"18%"`.
  - Numbers are formatted `en-US` (`"52,360"`).
- **`stats`, Forever:** Health, power, the highest primary, Stamina, "Critical strike" (one decimal place, `"4.6%"`), and "Armor" (`armor.effective`).
- **`specs`, retail:**
  - One entry per name in `classSpecs`, in that order.
  - `active` is true when the name matches `active_specialization.name`.
  - `heroTalent` comes from that spec's active loadout `selected_hero_talent_tree.name`, or `active_hero_talent_tree.name` for the active spec.
  - `pvpTalents` comes from `pvp_talent_slots[].selected.talent.name`.
  - If `classSpecs` is null, fall back to the specs the API lists.
- **`specs`, Forever:** from the `is_active` group in `specialization_groups`, one entry per specialization with `spentPoints`. `active` is true for the highest `spent_points`; if all are 0, none is active.
- **`raids`:** take the `expansions` entry with the highest `expansion.id`. Map each instance's modes to `{ difficulty: difficulty.name, completed: progress.completed_count, total: progress.total_count }`. Use `null` when there are no expansions.

- [ ] **Step 1: Write `scripts/capture-fixtures.mjs`.** Run it as `node --env-file=.dev.vars scripts/capture-fixtures.mjs`.
  - It fetches, for Cònsecrator and Recurve: profile, equipment, statistics, specializations, character-media, pvp-summary, mythic-keystone-profile and encounters/raids.
  - It strips every `_links` and `key` field and keeps only the first 3 entries of `encounters.expansions`.
  - It writes `test/fixtures/{retail-consecrator,forever-recurve}.json` as `{ profile, equipment, … }`.
  - Run it once and commit the fixtures. Each should be well under 200 KB.
- [ ] **Step 2: Write failing tests** in `test/character-view.test.js`. These values are the real data captured 2026-11-16; if a refreshed fixture changes a value, update the assertion to match the fixture.
  - `retail: maps equipment with quality, icon and negated stats`: the HEAD item is `name "Forgeborn Helm"`, `quality "RARE"`, `itemLevel 80`, with `icon` from `itemIcons`. Its stats include `{ text: "+18 Intellect", negated: true }`.
  - `retail: item without an icon gets icon null`, when `itemIcons` lacks that item's id.
  - `retail: stats strip`: labels are exactly `["Health","Mana","Strength","Stamina","Critical strike","Haste","Mastery","Versatility"]`. Health is `"52,360"`; Critical strike is `"18%"`.
  - `retail: specs list every class spec with the active one marked`: with `classSpecs ["Holy","Protection","Retribution"]`, only Retribution is active, its `heroTalent` is `"Templar"`, and it has 3 `pvpTalents`.
  - `retail: raids come from the newest expansion`: `raids.expansion` is the name of the highest-id expansion in the fixture.
  - `retail: pvp and mythic`: `pvp.honorLevel 2`, `honorableKills 5103`, `mythicPlus.rating null`.
  - `forever: specs come from the active group`: `[{ name: "Beast Mastery", active: true, spentPoints: 14, heroTalent: null, pvpTalents: [] }]`.
  - `forever: mythicPlus is null and raids is null when there are no expansions`.
  - `forever: equipment includes RANGED and AMMO; the set string and enchantments come through`: WAIST `set` is `"Defias Leather (1/5)"`.
  - `a null section gives an empty but valid view`: `statistics: null` gives `stats: []`, and `equipment: null` gives `equipment: []`.
- [ ] **Step 3: Run** `npm test`. Expected: FAIL, the module isn't found.
- [ ] **Step 4: Implement `buildCharacterView`** in `src/views/character.js`, as pure functions with no I/O.
- [ ] **Step 5: Run** `npm test`. Expected: PASS.
- [ ] **Step 6: Commit** the script, fixtures, view and test: "Add character view builder".

### Task 3: Index summaries and URL routes

**Files:**
- Modify: `src/characters.js`
- Create: `src/views/summary.js`
- Test: `test/summary.test.js`

**Interfaces:**
- Produces:
  - Each `trackedCharacters()` entry gains `route: string[]`: `["retail", realm, name]` or `["forever", "{name}-{surname}"]`, as lowercase, undecoded strings (e.g. `"cònsecrator"`).
  - Each entry also gains `displayName`: the configured name with its first letter upper-cased. Forever entries also get `displaySurname`.
  - `buildSummary(character, profile, media, fetchedAt) → Summary`.
  - `notListedSummary(character) → Summary`.

```js
// Summary
{ key, game, status: "ok" | "not-listed" | "error", route,
  name, surname: string | null, realm: string | null, ruleset: string | null,
  level, race, characterClass, spec, faction /* "HORDE"|"ALLIANCE"|null */, itemLevel,
  title /* active_title.name | null */, guild /* guild.name | null */, achievementPoints,
  inset /* media "inset" | "avatar" | null */, lastSuccessAt, error? }
```

- **Not listed:** a not-listed summary is `{ key, game, status: "not-listed", route, name: displayName, surname: displaySurname ?? null }`.
- **Forever spec:** for Forever, the summary's `spec` is the active spec from Task 2's rules. Pass it in as a fifth argument `spec`, or `null`.

- [ ] **Step 1: Write failing tests**:
  - `retail summary`, built from the retail fixture: `route ["retail","barthilas","cònsecrator"]`, `title "Vengeance Incarnate"`, `guild "Big Chur"`, `achievementPoints 11940`, `faction "HORDE"`, `ruleset null`.
  - `forever summary`: `realm null`, `ruleset "Normal"`, `surname "Ravenholt"`, `route ["forever","recurve-ravenholt"]`.
  - `not-listed summary has display names`: `consecrator`/`ravenholt` gives `name "Consecrator"`, `surname "Ravenholt"`.
  - `trackedCharacters routes`: every entry has a `route` whose first element equals `game`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement** the `characters.js` additions and `src/views/summary.js`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit**: "Add index summaries with routes".

### Task 4: Rewire the sync to write v1 views

**Files:**
- Modify: `src/sync.js`, `src/index.js`, `test/sync.test.js`

**Interfaces:**
- Consumes: Task 1 `createRefs`, Task 2 `buildCharacterView`, Task 3 `buildSummary` / `notListedSummary`.
- Produces:
  - **KV writes:**
    - `index`: `{ schemaVersion: 1, updatedAt, characters: Summary[] }`.
    - `view:v1:{key}:character`: a `CharacterView`.
  - **Exports:** `export const SCHEMA_VERSION = 1` and `syncAll({ client, kv, characters, now, maxNewLookups })`.

**Behaviour:**

- **Endpoints per character:** profile, then in parallel: equipment, statistics, specializations, character-media, pvp-summary, encounters/raids, and (retail only) mythic-keystone-profile.
- **Icons and class specs** come from `refs`.
- **No longer written:** `character:` and `icon:` keys.
- **Profile 404:** `notListedSummary`, and no view is written.
- **Profile error or thrown error:** keep the previous summary with `status: "error", error`, and leave the view untouched.
- **A section failing** (non-200) becomes `null` in the builder input, and the view is still written.
- **End-of-run log line:** `{"event":"armory-sync","counts":{…},"refs":{hits,fetched,skipped}}`.

This step rewrites the existing sync tests, because the stored contract changes on purpose. The old tests asserted the v0 `character:` record, which the approved spec removes.

- [ ] **Step 1: Rewrite `test/sync.test.js`** for the v1 contract. Keep the fake KV and fake fetch helpers, and serve the Task 2 fixtures from the fake fetch.
  - `writes index v1 and a character view for a listed character`: `index.schemaVersion === 1`, and `view:v1:forever:us:recurve-ravenholt:character` exists with `schemaVersion 1`.
  - `not-listed writes no view`.
  - `profile failure keeps the previous view and marks the summary error`: seed KV with an old view and summary, and have the profile return 503. The view is unchanged, and the summary is `status "error"` with `error "profile HTTP 503"`.
  - `a failed section does not stop the view`: equipment 404 gives a view with `equipment: []`.
  - `writes no legacy keys`: no KV key starts with `character:` or `icon:`.
- [ ] **Step 2: Run** `npm test`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement** the changes in `src/sync.js` and `src/index.js`.
- [ ] **Step 4: Run** `npm test`. Expected: all PASS.
- [ ] **Step 5: Commit**: "Write v1 views instead of raw records".

### Task 5: Release v2.0.0

**Files:**
- Modify: `README.md`, `package.json` (`"version": "2.0.0"`), `wrangler.jsonc` (comments only, if needed)

- [ ] **Step 1: Rewrite the README's "What gets stored" section** around the v1 contract:
  - the key table (`index`, `view:v1:{key}:character`, `ref:…`);
  - the Summary and CharacterView shapes, each with a trimmed example;
  - the schema-version rule from the spec ("Schema changes");
  - "Reading the data", with the `view:v1:` key example;
  - an **"Upgrading from v1.x"** section: the `character:` and `icon:` keys are no longer written, and you can delete them with `npx wrangler kv key list --binding WOW_ARMORY --remote --prefix character:` then `kv bulk delete`.
- [ ] **Step 2: Run** `npm test`. Expected: PASS.
- [ ] **Step 3: Run the sync against the real API.**
  - Run `npm run dev` in the background, then `curl "http://127.0.0.1:8787/cdn-cgi/local/scheduled?cron=17+14+*+*+*"`.
  - Expected log: `counts {"ok":13,"not-listed":8}` (or more ok if more Forever characters have reached level 10), and `refs.skipped 0`.
  - Then read `index` and `view:v1:retail:us:barthilas:cònsecrator:character` with `npx wrangler kv key get … --binding WOW_ARMORY --remote`. Check that `specs` has 3 entries, the equipment has 15 items each with an `icon`, and the view is under 100 KB.
- [ ] **Step 4: Delete the legacy keys** with wrangler: list the `character:` and `icon:` prefixes, write the key names to a scratch JSON file, then `npx wrangler kv bulk delete <file> --binding WOW_ARMORY --remote`. Confirm both lists come back empty afterwards.
- [ ] **Step 5: Deploy** with `npm run deploy`. Expected: `schedule: 17 14 * * *` and the `WOW_ARMORY` binding in the output.
- [ ] **Step 6: Commit, tag and push**: "Release v2.0.0: views instead of raw records", then `git tag v2.0.0`, `git push --follow-tags`.

---

## Part B: `nerdz-landing`

### Task 6: KV binding, contract types and path resolution

**Files:**
- Modify: `wrangler.jsonc` (add `{ "binding": "WOW_ARMORY", "id": "3f1c3a246ead46b6a6bddeb7db8b8455" }` to `kv_namespaces`, with a comment pointing at the spec), `cloudflare-env.d.ts` (add `WOW_ARMORY: { get(key: string, type: "json"): Promise<unknown> }`)
- Create: `src/lib/warcraft/types.ts`, `src/lib/warcraft/resolve.ts`
- Test: `src/lib/warcraft/resolve.test.ts`, run with `node --test src/lib/warcraft/resolve.test.ts` (Node 24 strips types natively). `resolve.ts` must have no imports.

**Interfaces:**
- Produces:
  - **`types.ts`:** TypeScript mirrors of `Summary`, `ArmoryIndex` (`{ schemaVersion: number; updatedAt: string; characters: Summary[] }`) and `CharacterView`, exactly as in Tasks 2 and 3.
  - **`resolve.ts`:**
    - `TABS = ["character","achievements","collections","pve","pvp","reputation"] as const`, and `type Tab = typeof TABS[number]`.
    - `TAB_LABELS: Record<Tab,string>` = `"Character"`, `"Achievements"`, `"Collections"`, `"Dungeons & Raids"`, `"Player vs Player"`, `"Reputation"`.
    - `resolveCharacterPath(characters: {route: string[]}[], segments: string[]) → { index: number; tab: Tab } | null`.
    - `characterHref(route: string[], tab?: Tab) → string`. It gives `/lab/warcraft/` plus the `encodeURIComponent` of each segment joined by `/`, plus `/{tab}` unless the tab is `character`.

- [ ] **Step 1: Write failing tests**:
  - `matches a retail character with no tab as the character tab`.
  - `matches encoded and decoded accents`: `["retail","barthilas","c%C3%B2nsecrator"]` and `["retail","barthilas","cònsecrator"]` both give index 0.
  - `matches a forever character with a tab`: `["forever","recurve-ravenholt","reputation"]` gives tab `reputation`.
  - `unknown tab is null`: `[…,"talents"]`.
  - `unknown character is null`.
  - `extra segments are null`.
  - `malformed percent-encoding is null, not a throw`: `["retail","barthilas","%E0%A4%A"]`.
  - `characterHref encodes accents`: `"/lab/warcraft/retail/barthilas/c%C3%B2nsecrator"`.
- [ ] **Step 2: Run** `node --test src/lib/warcraft/resolve.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `types.ts` and `resolve.ts`, and add the binding and env type.
- [ ] **Step 4: Run** the tests again. Expected: PASS. Then run `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 5: Commit**: "feat(warcraft): WOW_ARMORY binding, contract types, path resolution".

### Task 7: Data access, roster page and Workbench card

**Files:**
- Create: `src/lib/warcraft/data.ts`, `src/app/lab/warcraft/page.tsx`, `src/app/lab/warcraft/warcraft.css`, `src/components/warcraft/RosterCard.tsx`, `src/components/warcraft/Badges.tsx`
- Modify: `src/components/Workbench.tsx` (a new `WORKBENCH` entry: `id "wb-warcraft"`, `title "World of Warcraft"`, `tag "retail · forever"`, `cap "Every character I play, synced nightly from Blizzard."`, `span "span-4"`, `href "/lab/warcraft"`)

**Interfaces:**
- Consumes: Task 6 types and `characterHref`.
- Produces:
  - **`data.ts`** (server only):
    - `getIndex() → Promise<ArmoryIndex | null>`. It returns `null` when the binding or the key is missing, or when `schemaVersion` isn't a number.
    - `getCharacterView(key: string) → Promise<CharacterView | null>`. It tries `view:v1:{key}:character` and, once a later version exists, falls back to the version before. Define `SUPPORTED_VIEW_VERSIONS = [1]`, newest first.
  - **`Badges.tsx`:**
    - `FactionBadge({ faction })`: the Horde / Alliance tint pill.
    - `GameBadge({ summary })`: `"Retail · {realm}"` or `"Forever · {ruleset}"`.
  - **`warcraft.css`:** the quality and class colour variables (Global Constraints) and the roster, header, tab bar and paper-doll classes. Every class is prefixed `wow-`.

**Roster page:**
- `export const dynamic = "force-dynamic"`, and metadata title `"World of Warcraft — nerdz.cloud"`.
- Structure: `section` / `frame` / `SectionHead` (title `World of <em>Warcraft</em>`, caption `retail · forever · synced nightly`), then the intro line from the mockup.
- **Retail section:** retail `ok`/`error` summaries, sorted by level then item level, both descending. The heading shows the count and realms.
- **Forever section:** `ok`/`error` cards first, then `not-listed` cards. Not-listed cards are dashed, have no link, and say "Appears in Blizzard's API at level 10".
- **Footer:** `updated {d MMM · HH:mm}`, in NZ time.
- **No index:** `getIndex()` null gives one paragraph: "No characters synced yet."

- [ ] **Step 1: Implement** `data.ts`, `Badges.tsx`, `RosterCard.tsx`, the page, `warcraft.css` and the Workbench entry. The card follows the mockup: inset image, a 3 px class-colour stripe, name with surname, item level, a "level race spec class" line, and both badges.
- [ ] **Step 2: Run** `npx tsc --noEmit && npm run lint`. Expected: clean.
- [ ] **Step 3: Run** `npm run dev` and open `http://localhost:3000/lab/warcraft`.
  - Expected: 12 retail cards with Cònsecrator first, 1 listed Forever card and 8 dashed ones.
  - The page renders in both themes.
  - With the binding removed temporarily via a dev override, it shows "No characters synced yet." Restore the binding afterwards.
- [ ] **Step 4: Commit**: "feat(warcraft): roster page and workbench card".

### Task 8: Character page shell (header, tab bar, coming soon, 404s)

**Files:**
- Create: `src/app/lab/warcraft/[...path]/page.tsx`, `src/components/warcraft/CharacterHeader.tsx`, `src/components/warcraft/TabBar.tsx`, `src/components/warcraft/ComingSoon.tsx`

**Interfaces:**
- Consumes: `getIndex`, `getCharacterView`, `resolveCharacterPath`, `characterHref`, `TABS`, `TAB_LABELS`, and the badges.
- Produces: `CharacterHeader({ summary, updatedAt })`, `TabBar({ route, active })`, and the page.

**The page:**
- `dynamic = "force-dynamic"`.
- It resolves `params.path`, and calls `notFound()` when the path doesn't resolve or there's no index.
- `generateMetadata` gives the title `"{name} — World of Warcraft — nerdz.cloud"`.
- **Header**, as in the mockup:
  - badges, then the name (and surname), then the title in italic glow;
  - "level race spec class" with the class word in class colour, and the guild in gold `‹…›`;
  - stat blocks: achievement points, item level, updated time.
  - When `status === "error"`, it adds "data from {lastSuccessAt}" in `--ink-mute`.
- **Breadcrumb:** `lab / warcraft / {game} / {realm}`.
- **Tab bar:** a `<nav aria-label="Character sections">` of six links, with `aria-current="page"` on the active one. It scrolls sideways on narrow screens.
- **Tab bodies:** the `character` tab renders Task 9's component (a placeholder until Task 9 lands). Every other tab renders `ComingSoon` ("{Tab label} is coming soon.").

- [ ] **Step 1: Implement** the files.
- [ ] **Step 2: Run** `npx tsc --noEmit && npm run lint`. Expected: clean.
- [ ] **Step 3: Check in the dev server:**
  - `/lab/warcraft/retail/barthilas/c%C3%B2nsecrator` renders the header and tabs.
  - `/…/reputation` renders "Reputation is coming soon."
  - `/lab/warcraft/retail/barthilas/nobody` and `/lab/warcraft/forever/recurve-ravenholt/talents` return 404.
- [ ] **Step 4: Commit**: "feat(warcraft): character page shell with tabs".

### Task 9: Character tab

**Files:**
- Create: `src/components/warcraft/CharacterTab.tsx`, `src/components/warcraft/ItemSlot.tsx` (`"use client"`), `src/components/warcraft/StatsStrip.tsx`, `src/components/warcraft/SpecCards.tsx`, `src/components/warcraft/SummaryPanels.tsx`
- Modify: `src/app/lab/warcraft/[...path]/page.tsx` (render `CharacterTab`), `src/app/lab/warcraft/warcraft.css`

**Interfaces:**
- Consumes: `CharacterView`, `Summary`.
- Produces: `CharacterTab({ view, summary })`, and `ItemSlot({ item, slotLabel, side: "left" | "right" | "bottom" })`. When `item` is null, the slot shows an empty frame labelled with the slot name.

**Slot layout** (by API slot type):
- **Left:** `HEAD, NECK, SHOULDER, BACK, CHEST, SHIRT, TABARD, WRIST`.
- **Right:** `HANDS, WAIST, LEGS, FEET, FINGER_1, FINGER_2, TRINKET_1, TRINKET_2`.
- **Bottom:** `MAIN_HAND, OFF_HAND`, plus `RANGED` and `AMMO` for Forever.
- Missing slots render empty.
- **The character render** sits between the columns. Without a render, show an empty panel.

**Tooltip:**
- It opens on hover and on keyboard focus, and closes on mouse leave, blur and Escape.
- The trigger is a `<button>`, with `aria-describedby` pointing at the `role="tooltip"` element.
- **Content order:**
  1. name, in quality colour;
  2. `nameDescription`, in uncommon green;
  3. "Item Level N" in gold;
  4. binding;
  5. inventory type and subclass on one line;
  6. armour;
  7. weapon damage, speed and dps;
  8. stats (negated ones in `--ink-dim`);
  9. enchantments in uncommon green;
  10. sockets;
  11. spells;
  12. set in gold;
  13. requirement;
  14. description in gold italics.

**Below the gear:**
- `StatsStrip` (the `view.stats` grid).
- `SpecCards` (active card with a glow border, "Active" or "Inactive" label, hero talent, a count of PvP talents, spent points for Forever).
- `SummaryPanels`:
  - Mythic+ only when `view.mythicPlus` isn't null. Show the rating, or "No keystone runs this season."
  - Raid progression: the expansion name, then one row per instance with its best mode as `completed/total` plus the difficulty initial. Without raids: "No raid kills recorded."
  - Player vs Player: honor level (or PvP rank for Forever) and honourable kills.

- [ ] **Step 1: Implement** the components and CSS, following the mockup. At ≤ 900 px wide, the two item columns stack above and below the render.
- [ ] **Step 2: Run** `npx tsc --noEmit && npm run lint && npm run build`. Expected: all succeed.
- [ ] **Step 3: Browser check** in the dev server, for Cònsecrator and Recurve:
  - The gear matches the real Armory (15 retail items, 13 Forever items), and every icon loads.
  - Hovering shows the tooltip, Tab key focus shows it, and Escape hides it.
  - Empty slots are framed.
  - Both themes, and 375 px width (no sideways page scroll).
  - Recurve shows Beast Mastery with 14 points and no Mythic+ panel.
- [ ] **Step 4: Commit**: "feat(warcraft): character tab with paper doll and tooltips".

### Task 10: Ship

- [ ] **Step 1: Run** `node --test src/lib/warcraft/resolve.test.ts && npm run build`. Expected: PASS.
- [ ] **Step 2: Update the docs:** the spec's status line to "step 1 shipped", the README's route table (add `/lab/warcraft`), and `.claude/session-journal.md`. Commit.
- [ ] **Step 3: Get Gavin's go-ahead, then push.** Pushing to `main` deploys the live site through `.github/workflows/deploy.yaml`, so ask before pushing. Then watch the Actions run until it's green.
- [ ] **Step 4: Check the live site:** `https://nerdz.cloud/lab/warcraft` and Cònsecrator's page, in both themes.
