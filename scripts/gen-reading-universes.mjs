// Generator for the universe-section reading guides: Solaria (main path +
// Sorrow & Starlight / Beyond the Veil tandem), Throne of Glass, ACOTAR,
// Crescent City and the combined Maasverse order. Upserts into
// src/lib/reading.data.json by slug — never touches other guides.
//
// Sources for every order and bonus placement:
//   docs/research/2026-09-23-bonus-chapters-and-tandem-reads.md
// Mid-book bonus chapters are modelled as chapter-range items around the
// bonus ("ACOMAF ch.1–38", bonus, "ch.39–end") so readers tick the book
// in the same places they'd pause it.
import { promises as fs } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "src", "lib", "reading.data.json");
const UPDATED = "2026-09-23";

const slug = (prefix, t) =>
  `${prefix}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

/** [label, book, note?] rows → items with content-derived ids. */
const rows = (prefix, list) =>
  list.map(([label, book, note]) => ({
    id: slug(prefix, label),
    book,
    label,
    ...(note ? { note } : {}),
  }));

// ── Solaria: main path ────────────────────────────────────────
// Labels of pre-existing items are unchanged so their ids (and readers'
// saved ticks) survive. Order follows Read Romantasy's bonus-aware
// "Emotional Impact" order; the base split matches tlbranson, Bookish
// Goblin and Darling Reader.
const solaria = {
  slug: "solaria-reading-order",
  title: "The Solaria Universe — Reading Order",
  summary:
    "Zodiac Academy and everything orbiting it — Ruthless Boys, Darkmore, Sins of the Zodiac, every novella and bonus story — in one spoiler-safe path.",
  intro:
    "Peckham & Valenti say there's no single right way to read Solaria, so this is the path the bonus-aware guides converge on: three Zodiac Academy books to learn the world, all of Ruthless Boys (set five years earlier), then the rest of ZA with every companion story slotted where it lands safely. Darkmore (five years later) waits until after the finale, and Sins of the Zodiac comes last. Several bonus stories were later collected in Live and Let Lionel — the notes say which, so you can skip repeats.",
  updated: UPDATED,
  books: [
    { key: "za", title: "Zodiac Academy", accent: "gold" },
    { key: "rb", title: "Ruthless Boys of the Zodiac", accent: "glow" },
    { key: "dp", title: "Darkmore Penitentiary", accent: "magenta" },
    { key: "sz", title: "Sins of the Zodiac", accent: "glow-soft" },
    { key: "novella", title: "Novellas & bonus stories", accent: "ink" },
  ],
  items: rows("sol", [
    ["Zodiac Academy: The Awakening", "za", "the starting point"],
    ["Ruthless Fae", "za"],
    ["The Reckoning", "za"],
    ["Dark Fae", "rb", "Ruthless Boys is set ~5 years before ZA — reading it here makes ZA's later crossovers land"],
    ["Savage Fae", "rb"],
    ["Vicious Fae", "rb"],
    ["Broken Fae", "rb"],
    ["Warrior Fae", "rb"],
    ["Shadow Princess", "za"],
    ["Origins of an Academy Bully", "novella", "#0.5 prequel (Darius & Orion) — reads best once you know them"],
    ["Savage", "novella", "Hail & Merissa Vega — from the Hell Hath No Fury anthology; also in Live and Let Lionel"],
    ["The Shimmering Springs", "novella", "Caleb & Seth — from the Nightingale anthology; also in Live and Let Lionel"],
    ["The Tale of Geraldine and the Moon Madness", "novella", "short Geraldine story set at the Lunar Eclipse; availability varies"],
    ["The Awakening as Told by the Boys", "novella", "book 1 retold by the Heirs & Orion — the authors say read it after the original"],
    ["Foxy Tales", "novella", "limited charity paperback — alt-POV scenes from books 2–4"],
    ["Cursed Fates", "za"],
    ["The Big A.S.S. Party", "novella", "#5.5 — Max & Geraldine during Cursed Fates"],
    ["Seth on the Moon", "novella", "#5.6 — free in the authors' Reading Tribe group; also in Live and Let Lionel"],
    ["Night", "novella", "⚠ the twins meet the Ruthless Boys — major spoilers for BOTH series; only after all of Ruthless Boys and Cursed Fates. Also in Live and Let Lionel"],
    ["Fated Throne", "za"],
    ["Heartless Sky", "za"],
    ["Sorrow and Starlight", "za", "optional: read it chapter-by-chapter with Beyond the Veil — see the tandem guide"],
    ["Beyond the Veil", "za", "#8.5 — the authors say read after book 8"],
    ["Live and Let Lionel", "novella", "#8.6 — collects Savage, Shimmering Springs, Seth on the Moon and Night plus new scenes and a new map; skip what you've read"],
    ["Restless Stars", "za", "the finale"],
    ["On the Cursed Day of Christmas", "za", "ZA10 — illustrated advent-calendar book, October 2026"],
    ["Caged Wolf", "dp", "Darkmore is set ~5 years after ZA — save it for after the finale"],
    ["Alpha Wolf", "dp"],
    ["Feral Wolf", "dp"],
    ["Wild Wolf", "dp"],
    ["Never Keep", "sz", "Sins of the Zodiac — a new cast in the same world"],
    ["Echo Fort", "sz"],
    ["Cinder Vale", "sz"],
  ]),
};

// ── Solaria: Sorrow & Starlight + Beyond the Veil tandem ──────
// Transcribed from SQUIB's "S.T.R.A.P.O.N." checklist image. "ooo" marks
// chapters the guide deliberately reads out of order (BTV 15 before 14,
// 24 before 23).
const TANDEM = [
  ["btv", 1, 2], ["ss", 1, 1], ["btv", 3, 3], ["ss", 2, 6], ["btv", 4, 4],
  ["ss", 7, 11], ["btv", 5, 5], ["ss", 12, 18], ["btv", 6, 7], ["ss", 19, 23],
  ["btv", 8, 8], ["ss", 24, 24], ["btv", 9, 9], ["ss", 25, 26], ["btv", 10, 10],
  ["ss", 27, 28], ["btv", 11, 11], ["ss", 29, 30], ["btv", 12, 12], ["ss", 31, 32],
  ["btv", 13, 13], ["ss", 33, 34], ["btv", 15, 15, "ooo"], ["ss", 35, 35],
  ["btv", 14, 14, "ooo"], ["ss", 36, 40], ["btv", 16, 16], ["ss", 41, 43],
  ["btv", 17, 17], ["ss", 44, 48], ["btv", 18, 18], ["ss", 49, 52], ["btv", 19, 19],
  ["ss", 53, 53], ["btv", 20, 20], ["ss", 54, 56], ["btv", 21, 21], ["ss", 57, 58],
  ["btv", 22, 22], ["ss", 59, 61], ["btv", 24, 24, "ooo"], ["ss", 62, 62],
  ["btv", 23, 23, "ooo"], ["ss", 63, 65], ["btv", 25, 25], ["ss", 66, 72],
  ["btv", 26, 26], ["ss", 73, 73], ["btv", 27, 27], ["ss", 74, 74], ["btv", 28, 28],
  ["ss", 75, 82], ["btv", 29, 29], ["btv", "Epilogue"], ["ss", 83, 83],
];
const TANDEM_TITLE = { btv: "Beyond the Veil", ss: "Sorrow and Starlight" };
const tandemItems = [];
for (const [book, a, b, flag] of TANDEM) {
  if (typeof a === "string") {
    tandemItems.push({ id: `btvss-${book}-epilogue`, book, label: `${TANDEM_TITLE[book]} — Epilogue` });
    continue;
  }
  for (let ch = a; ch <= b; ch++) {
    tandemItems.push({
      id: `btvss-${book}-${ch}`,
      book,
      label: `${TANDEM_TITLE[book]} CH${ch}${flag === "ooo" ? " (out of order)" : ""}`,
      ...(flag === "ooo" ? { note: "the guide deliberately reads this out of order" } : {}),
    });
  }
}
{
  const ids = new Set(tandemItems.map((i) => i.id));
  if (ids.size !== tandemItems.length) throw new Error("tandem: duplicate ids");
  for (let ch = 1; ch <= 83; ch++)
    if (!ids.has(`btvss-ss-${ch}`)) throw new Error(`tandem: missing S&S ch.${ch}`);
  for (let ch = 1; ch <= 29; ch++)
    if (!ids.has(`btvss-btv-${ch}`)) throw new Error(`tandem: missing BTV ch.${ch}`);
  if (!ids.has("btvss-btv-epilogue")) throw new Error("tandem: missing BTV epilogue");
  if (tandemItems.length !== 83 + 30) throw new Error(`tandem: expected 113 items, got ${tandemItems.length}`);
}
const btvTandem = {
  slug: "sorrow-starlight-beyond-the-veil-tandem",
  title: "Sorrow and Starlight & Beyond the Veil — Tandem Read",
  summary:
    "Zodiac Academy 8 and 8.5 chapter by chapter — follow the living and the dead through the same days.",
  intro:
    "Beyond the Veil tells what happens among the dead while Sorrow and Starlight unfolds, so fans read them interleaved: mostly one Beyond the Veil chapter between runs of Sorrow and Starlight. Two pairs are read out of order on purpose (15 before 14, 24 before 23). Heads up: the authors' own advice is to read Beyond the Veil after book 8, so this is a fan way to read it — on a first read, the main Solaria path keeps them separate.",
  updated: UPDATED,
  credit: { text: "Tandem order by SQUIB (\"S.T.R.A.P.O.N.\" checklist)" },
  books: [
    { key: "ss", title: "Sorrow and Starlight (ZA8)", accent: "gold" },
    { key: "btv", title: "Beyond the Veil (ZA8.5)", accent: "glow" },
  ],
  items: tandemItems,
};

// ── Throne of Glass ───────────────────────────────────────────
const tog = {
  slug: "throne-of-glass-reading-order",
  title: "Throne of Glass — Reading Order with Bonus Chapters",
  summary:
    "All eight books plus the six scattered bonus chapters — blog-tour scenes, a deleted scene and three Empire of Storms exclusives — each in its slot.",
  intro:
    "Throne of Glass has six extra scenes that never made the standard editions: two from the 2013 Crown of Midnight blog tour, one from the US Throne of Glass paperback, and three from Empire of Storms retailer exclusives (one of them a deleted Heir of Fire scene). They're optional and mostly out of print, so they're marked as bonus. The Assassin's Blade goes where Sarah J. Maas lists it — after Crown of Midnight — but anywhere before Queen of Shadows works. When you reach Empire of Storms, consider the chapter-by-chapter tandem with Tower of Dawn.",
  updated: UPDATED,
  books: [
    { key: "tog", title: "Throne of Glass", accent: "gold" },
    { key: "bonus", title: "Bonus chapters", accent: "glow" },
    { key: "novella", title: "The Assassin's Blade", accent: "magenta" },
  ],
  items: rows("tog", [
    ["The Captain and the Prince", "bonus", "Dorian & Chaol — US Throne of Glass paperback extra; read before book 1"],
    ["Throne of Glass", "tog"],
    ["The Assassin and the Princess", "bonus", "Celaena & Nehemia — 2013 blog-tour scene"],
    ["The Assassin and the Captain", "bonus", "Celaena & Chaol — 2013 blog-tour scene; fits here or early in Crown of Midnight"],
    ["Crown of Midnight", "tog"],
    ["The Assassin's Blade", "novella", "five prequel novellas — the author's slot; after Heir of Fire also works, but read before Queen of Shadows"],
    ["Heir of Fire — ch. 1 to ~45", "tog"],
    ["Heir of Fire deleted scene: visitors at Mistward", "bonus", "Target exclusive of Empire of Storms — a deleted scene, approximate slot"],
    ["Heir of Fire — ~ch. 46 to end", "tog"],
    ["Queen of Shadows", "tog"],
    ["Chaol & Nesryn at sea", "bonus", "WHSmith (UK) exclusive of Empire of Storms — sets up Tower of Dawn"],
    ["Aelin in Terrasen", "bonus", "B&N exclusive of Empire of Storms — set as the book opens"],
    ["Empire of Storms", "tog", "or read it in tandem with Tower of Dawn — see the tandem guide"],
    ["Tower of Dawn", "tog", "happens at the same time as Empire of Storms"],
    ["Kingdom of Ash", "tog", "the finale — no bonus chapters exist for it"],
  ]),
};

// ── ACOTAR ────────────────────────────────────────────────────
const acotar = {
  slug: "acotar-reading-order",
  title: "A Court of Thorns and Roses — Reading Order with Bonus Chapters",
  summary:
    "The Court series with its three official bonus chapters slotted in by chapter — Wings and Embers, the Feyre & Rhys chapter and Azriel's Solstice.",
  intro:
    "ACOTAR has exactly three official bonus chapters: Wings and Embers (Cassian meets Nesta at the Archeron estate) from a Target edition of A Court of Mist and Fury, and two A Court of Silver Flames exclusives — a Feyre & Rhys chapter and Azriel's Solstice night. They're split into the books at the chapters where fans read them. A Court of Frost and Starlight is part of the series, not a bonus. Reading Crescent City too? Finish A Court of Silver Flames before House of Sky and Breath — see the Maasverse order.",
  updated: UPDATED,
  books: [
    { key: "acotar", title: "A Court of Thorns and Roses", accent: "gold" },
    { key: "bonus", title: "Bonus chapters", accent: "glow" },
    { key: "upcoming", title: "The Valkyrie Cycle (upcoming)", accent: "magenta" },
  ],
  items: rows("acotar", [
    ["A Court of Thorns and Roses", "acotar"],
    ["A Court of Mist and Fury — ch. 1–38", "acotar"],
    ["Wings and Embers", "bonus", "Cassian & Nesta — Target edition extra; Bloomsbury once shared it free"],
    ["A Court of Mist and Fury — ch. 39 to end", "acotar"],
    ["A Court of Wings and Ruin", "acotar"],
    ["A Court of Frost and Starlight", "acotar", "the Solstice novella — part of the series"],
    ["A Court of Silver Flames — ch. 1–21", "acotar"],
    ["Feyre & Rhys bonus chapter", "bonus", "B&N exclusive — the pregnancy talk"],
    ["A Court of Silver Flames — ch. 22–58", "acotar"],
    ["Azriel bonus chapter", "bonus", "Books-A-Million exclusive — Solstice night at the River House"],
    ["A Court of Silver Flames — ch. 59 to end", "acotar"],
    ["A Court of Splintered Harmony", "upcoming", "book 6 — The Valkyrie Cycle, October 27, 2026"],
    ["A Court of Forgotten Melody", "upcoming", "book 7 — January 12, 2027"],
  ]),
};

// ── Crescent City ─────────────────────────────────────────────
const cc = {
  slug: "crescent-city-reading-order",
  title: "Crescent City — Reading Order with Bonus Chapters",
  summary:
    "All three Crescent City books with the eight exclusive-edition bonus chapters slotted in by chapter — and the ACOTAR reading you need first.",
  intro:
    "House of Earth and Blood has no bonus chapters; House of Sky and Breath has three and House of Flame and Shadow five, spread across retailer editions. Each sits at the chapter fans read it. Important: House of Flame and Shadow is set largely in Prythian and leans on A Court of Silver Flames, so read all five ACOTAR books before House of Sky and Breath. Two of the anchors (House of Sky and Breath ch. 22 and 57) come from a single fan source.",
  updated: UPDATED,
  books: [
    { key: "cc", title: "Crescent City", accent: "gold" },
    { key: "bonus", title: "Bonus chapters", accent: "glow" },
  ],
  items: rows("cc", [
    ["House of Earth and Blood", "cc", "no bonus chapters exist for book 1"],
    ["House of Sky and Breath — ch. 1–8", "cc", "read all five ACOTAR books first"],
    ["Ruhn bonus chapter", "bonus", "Books-A-Million exclusive"],
    ["House of Sky and Breath — ch. 9–22", "cc"],
    ["Bryce & Hunt bonus chapter", "bonus", "B&N / Waterstones / Indigo exclusive — single-source placement"],
    ["House of Sky and Breath — ch. 23–57", "cc"],
    ["Tharion bonus chapter", "bonus", "Target exclusive — single-source placement"],
    ["House of Sky and Breath — ch. 58 to end", "cc"],
    ["House of Flame and Shadow — ch. 1–16", "cc"],
    ["Bryce, Nesta & Azriel bonus chapter", "bonus", "Walmart / WHSmith — spoils A Court of Silver Flames"],
    ["House of Flame and Shadow — ch. 17–80", "cc"],
    ["Ember & Randall bonus chapter", "bonus", "Books-A-Million / Indigo / Eason — spoils A Court of Silver Flames"],
    ["House of Flame and Shadow — ch. 81 to end", "cc"],
    ["Ruhn & Lidia bonus chapter", "bonus", "Target / Forbidden Planet — an epilogue"],
    ["Bryce & Hunt Solstice bonus chapter", "bonus", "B&N / Waterstones — an epilogue"],
    ["Bryce & Danika bonus chapter", "bonus", "indie / Blackwell's — a flashback; anywhere after book 1"],
  ]),
};

// ── Maasverse combined ────────────────────────────────────────
const maasverse = {
  slug: "maasverse-reading-order",
  title: "The Maasverse — Combined Reading Order",
  summary:
    "Throne of Glass, ACOTAR and Crescent City in publication order — the one sequence that keeps every cross-universe reveal safe.",
  intro:
    "Sarah J. Maas says you can start any of her three series first, but they aren't sealed off: Crescent City crosses into Prythian and leans on A Court of Silver Flames, and it nods to Throne of Glass. Reading everything in publication order guarantees you meet each crossover after the book it depends on. Prefer to binge one series at a time? Read ACOTAR 1–5 and Throne of Glass in either order, then Crescent City — just never Crescent City 2–3 before A Court of Silver Flames. Bonus chapters live in each series' own guide.",
  updated: UPDATED,
  books: [
    { key: "tog", title: "Throne of Glass", accent: "gold" },
    { key: "acotar", title: "A Court of Thorns and Roses", accent: "glow" },
    { key: "cc", title: "Crescent City", accent: "magenta" },
  ],
  items: rows("mv", [
    ["Throne of Glass", "tog", "2012"],
    ["Crown of Midnight", "tog", "2013"],
    ["The Assassin's Blade", "tog", "2014"],
    ["Heir of Fire", "tog", "2014"],
    ["A Court of Thorns and Roses", "acotar", "2015"],
    ["Queen of Shadows", "tog", "2015"],
    ["A Court of Mist and Fury", "acotar", "2016"],
    ["Empire of Storms", "tog", "2016 — tandem with Tower of Dawn if you like"],
    ["A Court of Wings and Ruin", "acotar", "2017"],
    ["Tower of Dawn", "tog", "2017"],
    ["A Court of Frost and Starlight", "acotar", "2018"],
    ["Kingdom of Ash", "tog", "2018"],
    ["House of Earth and Blood", "cc", "2020"],
    ["A Court of Silver Flames", "acotar", "2021 — must come before House of Sky and Breath"],
    ["House of Sky and Breath", "cc", "2022 — ends with a crossover into Prythian"],
    ["House of Flame and Shadow", "cc", "2024 — largely set in Prythian"],
    ["A Court of Splintered Harmony", "acotar", "October 27, 2026"],
    ["A Court of Forgotten Melody", "acotar", "January 12, 2027"],
  ]),
};

// ── Upsert ────────────────────────────────────────────────────
const upserts = [solaria, btvTandem, tog, acotar, cc, maasverse];
const guides = JSON.parse(await fs.readFile(OUT, "utf8"));
for (const g of upserts) {
  const ids = new Set(g.items.map((i) => i.id));
  if (ids.size !== g.items.length) throw new Error(`${g.slug}: duplicate item ids`);
  const idx = guides.findIndex((x) => x.slug === g.slug);
  if (idx >= 0) guides[idx] = g;
  else guides.push(g);
}
await fs.writeFile(OUT, JSON.stringify(guides, null, 2) + "\n", "utf8");
for (const g of upserts) console.log(`upserted ${g.slug} (${g.items.length} items)`);
console.log(`${guides.length} guides total`);
