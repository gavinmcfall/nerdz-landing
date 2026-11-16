import { test } from "node:test";
import assert from "node:assert/strict";
import { bestRaidMode, layoutSlots, raidRows } from "./doll.ts";

const item = (slot: string, slotName = slot) => ({ slot, slotName, name: `${slot} item` });

test("layoutSlots puts each slot in its column, in Armory order", () => {
  const { left, right, bottom } = layoutSlots([item("HANDS"), item("HEAD"), item("MAIN_HAND")], "retail");
  assert.deepEqual(left.map((s) => s.slot), ["HEAD", "NECK", "SHOULDER", "BACK", "CHEST", "SHIRT", "TABARD", "WRIST"]);
  assert.deepEqual(right.map((s) => s.slot), ["HANDS", "WAIST", "LEGS", "FEET", "FINGER_1", "FINGER_2", "TRINKET_1", "TRINKET_2"]);
  assert.deepEqual(bottom.map((s) => s.slot), ["MAIN_HAND", "OFF_HAND"]);
});

test("layoutSlots leaves missing slots empty with a label", () => {
  const { left } = layoutSlots([item("HEAD", "Head")], "retail");
  assert.equal(left[0].item?.name, "HEAD item");
  assert.equal(left[0].label, "Head");
  assert.equal(left[1].item, null);
  assert.equal(left[1].label, "Neck");
});

test("layoutSlots adds ranged and ammo for Forever", () => {
  const { bottom } = layoutSlots([], "forever");
  assert.deepEqual(bottom.map((s) => s.slot), ["MAIN_HAND", "OFF_HAND", "RANGED", "AMMO"]);
});

test("bestRaidMode picks the hardest difficulty with a kill", () => {
  assert.equal(
    bestRaidMode([
      { difficulty: "Normal", completed: 8, total: 8 },
      { difficulty: "Heroic", completed: 3, total: 8 },
      { difficulty: "Mythic", completed: 0, total: 8 },
    ]),
    "3/8 H",
  );
});

test("bestRaidMode is null with no kills", () => {
  assert.equal(bestRaidMode([{ difficulty: "Normal", completed: 0, total: 8 }]), null);
});

test("bestRaidMode spells out difficulties it has no short form for", () => {
  assert.equal(bestRaidMode([{ difficulty: "10 Player", completed: 2, total: 12 }]), "2/12 10 Player");
});

test("raidRows keeps only instances with a kill", () => {
  const rows = raidRows({
    expansion: "Legion",
    instances: [
      { name: "The Nighthold", modes: [{ difficulty: "Raid Finder", completed: 10, total: 10 }] },
      { name: "Antorus", modes: [{ difficulty: "Normal", completed: 0, total: 11 }] },
    ],
  });
  assert.deepEqual(rows, [{ name: "The Nighthold", progress: "10/10 LFR" }]);
});

test("raidRows is empty with no raids", () => {
  assert.deepEqual(raidRows(null), []);
});
