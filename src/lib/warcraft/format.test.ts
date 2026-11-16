import { test } from "node:test";
import assert from "node:assert/strict";
import { classSlug, formatSynced, sortRetail } from "./format.ts";

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
