import { test } from "node:test";
import assert from "node:assert/strict";
import { classSlug, dollScene, filterReputation, formatSynced, hasData, portraitStyle, reputationProgress, sortRetail, staleNote } from "./format.ts";

test("hasData is true only for a summary with a successful sync behind it", () => {
  assert.equal(hasData({ status: "ok", lastSuccessAt: "2026-11-16T14:17:00.000Z" }), true);
  assert.equal(hasData({ status: "error", lastSuccessAt: "2026-11-15T14:17:00.000Z" }), true);
  // A not-listed character whose profile then errored: no data to link to.
  assert.equal(hasData({ status: "error" }), false);
  assert.equal(hasData({ status: "not-listed" }), false);
});

test("staleNote says how old an error summary's data is", () => {
  assert.equal(staleNote({ status: "error", lastSuccessAt: "2026-11-15T14:17:00.000Z" }), "data from 16 nov · 03:17 nzdt");
  assert.equal(staleNote({ status: "ok", lastSuccessAt: "2026-11-15T14:17:00.000Z" }), null);
  assert.equal(staleNote({ status: "error" }), null);
});

test("formatSynced shows the day, month and time in New Zealand", () => {
  // 14:17 UTC on 16 Nov is 03:17 on 17 Nov in Auckland (NZDT, UTC+13).
  assert.equal(formatSynced("2026-11-16T14:17:00.000Z"), "17 nov · 03:17 nzdt");
});

test("formatSynced uses standard time in winter", () => {
  assert.equal(formatSynced("2026-06-16T14:17:00.000Z"), "17 jun · 02:17 nzst");
});

test("formatSynced returns null for a missing or bad date", () => {
  assert.equal(formatSynced(undefined), null);
  assert.equal(formatSynced("not a date"), null);
});

test("classSlug turns a class name into a CSS-safe token", () => {
  assert.equal(classSlug("Demon Hunter"), "demon-hunter");
  assert.equal(classSlug("Paladin"), "paladin");
  assert.equal(classSlug(null), "unknown");
});

test("sortRetail orders by level, then item level, highest first", () => {
  const sorted = sortRetail([
    { name: "a", level: 70, itemLevel: 90 },
    { name: "b", level: 80, itemLevel: 81 },
    { name: "c", level: 80, itemLevel: 102 },
    { name: "d" },
  ]);
  assert.deepEqual(sorted.map((s) => s.name), ["c", "b", "a", "d"]);
});

test("portraitStyle scales the render so the focus window fills the frame", () => {
  // Cònsecrator's measured focus: window starts 33.1% down, is 25.2% tall,
  // figure centred at 50.19% across.
  assert.deepEqual(portraitStyle({ x: 0.5019, top: 0.331, height: 0.252 }), {
    height: "396.8254%",
    top: "-131.3492%",
    left: "50%",
    transform: "translateX(-50.19%)",
  });
});

test("dollScene stands the whole figure in its class background", () => {
  const url = "https://render.worldofwarcraft.com/us/character/barthilas/77/206868045-main-raw.png";
  const background = "https://render.worldofwarcraft.com/profile-backgrounds/v2/armory_bg_class_demon_hunter.jpg";
  const focus = { x: 0.4988, top: 0.2904, height: 0.2778 };
  // Dìabolical's figure frame: 54.5% of the render tall, so the render is
  // drawn at 1/0.545 of the frame's height.
  const scene = dollScene({ portrait: { url, focus, figure: { x: 0.4988, top: 0.2904, height: 0.545 } }, background });
  assert.deepEqual(scene, {
    url,
    background,
    stageStyle: { height: "183.4862%", top: "-53.2844%", left: "50%", transform: "translateX(-49.88%)" },
  });
});

test("dollScene keeps the figure without a background when the class has none", () => {
  const portrait = { url: "u", focus: { x: 0.5, top: 0.1, height: 0.3 }, figure: { x: 0.5, top: 0.1, height: 0.6 } };
  assert.equal(dollScene({ portrait, background: null })?.background, null);
  assert.equal(dollScene({ portrait })?.background, null);
});

test("dollScene is null without a figure frame (index older than sync 2.2)", () => {
  assert.equal(dollScene({ portrait: { url: "u", focus: { x: 0.5, top: 0.1, height: 0.3 } } }), null);
  assert.equal(dollScene({ portrait: null }), null);
  assert.equal(dollScene({}), null);
});

const faction = (over: object) => ({ id: 1, name: "Ironforge", standing: "Friendly", value: 1571, max: 6000, renown: null, paragon: null, ...over });

test("reputationProgress fills the bar by progress through the current standing", () => {
  assert.deepEqual(reputationProgress(faction({})), { percent: 26, detail: "1,571 / 6,000" });
});

test("reputationProgress shows a full bar and no numbers at the top standing", () => {
  assert.deepEqual(reputationProgress(faction({ standing: "Exalted", value: 0, max: 0 })), { percent: 100, detail: null });
});

test("reputationProgress shows paragon progress once a faction has it", () => {
  const nightfallen = faction({ standing: "Exalted", value: 0, max: 0, paragon: { value: 9137, max: 10000 } });
  assert.deepEqual(reputationProgress(nightfallen), { percent: 91, detail: "Paragon 9,137 / 10,000" });
});

const GROUPS = [
  { name: "Legion", factions: [faction({ id: 1, name: "The Nightfallen" }), faction({ id: 2, name: "Valarjar" })] },
  { name: "Classic", factions: [faction({ id: 3, name: "Ironforge" }), faction({ id: 4, name: "Darnassus" })] },
];

test("filterReputation keeps factions whose name matches, ignoring case", () => {
  assert.deepEqual(
    filterReputation(GROUPS, "  NIGHT ").map((g) => [g.name, g.factions.map((f) => f.name)]),
    [["Legion", ["The Nightfallen"]]],
  );
});

test("filterReputation keeps a whole group when its name matches", () => {
  assert.deepEqual(filterReputation(GROUPS, "classic").map((g) => g.factions.length), [2]);
});

test("filterReputation returns every group for an empty query", () => {
  assert.equal(filterReputation(GROUPS, "   "), GROUPS);
});
