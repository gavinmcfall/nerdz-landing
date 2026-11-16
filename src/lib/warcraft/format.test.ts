import { test } from "node:test";
import assert from "node:assert/strict";
import { classSlug, formatSynced, hasData, sortRetail, staleNote } from "./format.ts";

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
