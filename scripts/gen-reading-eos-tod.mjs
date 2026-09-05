// One-off generator for the EOS/ToD tandem reading-order guide data.
// Expands the run-length sequence (transcribed from the source checklist
// image; its "CH55T/ower of Dawn CH56" typo corrected) into
// src/lib/reading.data.json, asserting the invariants: 145 items, EOS =
// Nightfall + CH1-75 (76), ToD = CH1-68 + Fireheart (69), each exactly once.
// Kept in-repo so the data can be regenerated if the order needs fixing.
import { promises as fs } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "src", "lib", "reading.data.json");

// Each entry: [book, from, to] for chapter runs, or [book, name] for the
// novella endpoints. Order is the reading order.
const SEQUENCE = [
  ["eos", "Nightfall"],
  ["eos", 1, 5], ["tod", 1, 1], ["eos", 6, 8], ["tod", 2, 3],
  ["eos", 9, 10], ["tod", 4, 6], ["eos", 11, 11], ["tod", 7, 7],
  ["eos", 12, 13], ["tod", 8, 10], ["eos", 14, 16], ["tod", 11, 12],
  ["eos", 17, 18], ["tod", 13, 16], ["eos", 19, 19], ["tod", 17, 17],
  ["eos", 20, 23], ["tod", 18, 21], ["eos", 24, 25], ["tod", 22, 23],
  ["eos", 26, 26], ["tod", 24, 24], ["eos", 27, 29], ["tod", 25, 28],
  ["eos", 30, 30], ["tod", 29, 31], ["eos", 31, 31], ["tod", 32, 32],
  ["eos", 32, 32], ["tod", 33, 35], ["eos", 33, 51], ["tod", 36, 37],
  ["eos", 52, 52], ["tod", 38, 40], ["eos", 53, 53], ["tod", 41, 42],
  ["eos", 54, 56], ["tod", 43, 43], ["eos", 57, 59], ["tod", 44, 48],
  ["eos", 60, 61], ["tod", 49, 51], ["eos", 62, 63], ["tod", 52, 53],
  ["eos", 64, 65], ["tod", 54, 56], ["eos", 66, 67], ["tod", 57, 57],
  ["eos", 68, 75], ["tod", 58, 68],
  ["tod", "Fireheart"],
];

const BOOK_TITLE = { eos: "Empire of Storms", tod: "Tower of Dawn" };
const BOOK_SHORT = { eos: "EOS", tod: "TOD" };

const items = [];
for (const run of SEQUENCE) {
  const [book, a, b] = run;
  if (typeof a === "string") {
    items.push({
      id: `${book}-${a.toLowerCase()}`,
      book,
      label: `${BOOK_SHORT[book]} — ${a}`,
    });
    continue;
  }
  for (let ch = a; ch <= b; ch++) {
    items.push({ id: `${book}-${ch}`, book, label: `${BOOK_TITLE[book]} CH${ch}` });
  }
}

// ── Invariants ────────────────────────────────────────────────
const ids = new Set(items.map((i) => i.id));
if (ids.size !== items.length) throw new Error("duplicate item ids");
if (items.length !== 145) throw new Error(`expected 145 items, got ${items.length}`);
const eos = items.filter((i) => i.book === "eos");
const tod = items.filter((i) => i.book === "tod");
if (eos.length !== 76) throw new Error(`expected 76 EOS items, got ${eos.length}`);
if (tod.length !== 69) throw new Error(`expected 69 ToD items, got ${tod.length}`);
for (let ch = 1; ch <= 75; ch++)
  if (!ids.has(`eos-${ch}`)) throw new Error(`missing eos-${ch}`);
for (let ch = 1; ch <= 68; ch++)
  if (!ids.has(`tod-${ch}`)) throw new Error(`missing tod-${ch}`);
if (items[0].id !== "eos-nightfall" || items[144].id !== "tod-fireheart")
  throw new Error("endpoints out of place");

const guide =
  {
    slug: "eos-tod-reading-order",
    title: "Empire of Storms & Tower of Dawn — Tandem Reading Order",
    summary:
      "Read EOS and ToD together in alternating chronological order — an interactive checklist that remembers your place.",
    intro:
      "Empire of Storms and Tower of Dawn run in parallel — two stories in two places over the same stretch of time, with no overlap. You can read either first, but reading them in tandem keeps the timeline in sync: follow this list top to bottom, ticking chapters as you go. Your progress is saved in this browser.",
    updated: "2026-08-26",
    books: [
      { key: "eos", title: "Empire of Storms", accent: "gold" },
      { key: "tod", title: "Tower of Dawn", accent: "glow" },
    ],
    items,
  };

// Upsert into the shared data file: other guides are hand-authored directly
// in reading.data.json, so this script must never clobber them.
let guides = [];
try {
  guides = JSON.parse(await fs.readFile(OUT, "utf8"));
} catch {
  // First run / missing file — start fresh.
}
const idx = guides.findIndex((g) => g.slug === guide.slug);
if (idx >= 0) guides[idx] = guide;
else guides.unshift(guide);

await fs.writeFile(OUT, JSON.stringify(guides, null, 2) + "\n", "utf8");
console.log(
  `gen-reading: ${items.length} items (${eos.length} EOS / ${tod.length} ToD) upserted → ${path.relative(process.cwd(), OUT)} (${guides.length} guide(s) total)`,
);
