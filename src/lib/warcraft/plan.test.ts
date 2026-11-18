import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PLAN, PLAN_KEY, coverage, levelFor, moveInQueue, parsePlan, readPlan, roleGroups, savePlan, type Plan } from "./plan.ts";

const clone = (): Plan => structuredClone(DEFAULT_PLAN);

test("the default plan is valid", () => {
  assert.deepEqual(parsePlan(DEFAULT_PLAN), DEFAULT_PLAN);
});

test("parsePlan rejects a spec from another class", () => {
  const plan = clone();
  plan.characters[0].dual = "Frost";
  assert.equal(parsePlan(plan), null);
});

test("parsePlan rejects a specialization that belongs to another profession", () => {
  const plan = clone();
  plan.characters[0].profs[1] = { p: "Blacksmithing", s: "Gnomish" };
  assert.equal(parsePlan(plan), null);
});

test("parsePlan rejects the same profession twice", () => {
  const plan = clone();
  plan.characters[0].profs = [{ p: "Mining", s: "" }, { p: "Mining", s: "" }];
  assert.equal(parsePlan(plan), null);
});

test("parsePlan rejects a queue that doesn't list each character once", () => {
  const plan = clone();
  plan.queue = [...plan.queue.slice(1), plan.queue[1]];
  assert.equal(parsePlan(plan), null);
});

test("parsePlan rejects junk", () => {
  assert.equal(parsePlan(null), null);
  assert.equal(parsePlan({ queue: [] }), null);
});

test("coverage lists who holds each profession", () => {
  const mining = coverage(DEFAULT_PLAN).find((r) => r.profession === "Mining")!;
  assert.deepEqual(mining.holders.map((h) => h.name), ["Consecrator", "Vengeance", "Eviscerator", "Soulmine"]);
});

test("coverage names the specializations nobody has", () => {
  const lw = coverage(DEFAULT_PLAN).find((r) => r.profession === "Leatherworking")!;
  assert.deepEqual(lw.specializations, [
    { name: "Dragonscale", taken: true },
    { name: "Elemental", taken: true },
    { name: "Tribal", taken: false },
  ]);
});

test("coverage flags a crafter whose gatherer nobody has", () => {
  const plan = clone();
  for (const c of plan.characters) c.profs = c.profs.map((pr) => (pr.p === "Herbalism" ? { p: "", s: "" } : pr)) as Plan["characters"][number]["profs"];
  const rows = coverage(plan);
  assert.equal(rows.find((r) => r.profession === "Herbalism")!.holders.length, 0);
  assert.deepEqual(rows.find((r) => r.profession === "Alchemy")!.supply, { gatherer: "Herbalism", covered: false, selfSupplied: false });
});

test("coverage notes when every crafter gathers its own materials", () => {
  const bs = coverage(DEFAULT_PLAN).find((r) => r.profession === "Blacksmithing")!;
  assert.deepEqual(bs.supply, { gatherer: "Mining", covered: true, selfSupplied: true });
});

test("roleGroups counts the starting spec and the dual spec", () => {
  const groups = roleGroups(DEFAULT_PLAN);
  assert.deepEqual(
    groups.Tank.map((e) => `${e.name} ${e.spec} ${e.dual ? "dual" : "now"}`),
    ["Valewarden Feral now", "Vengeance Protection dual"],
  );
  assert.equal(groups.Healer.length, 4);
});

test("moveInQueue moves a character and leaves the plan untouched", () => {
  const queue = moveInQueue(DEFAULT_PLAN.queue, "recurve", 0);
  assert.equal(queue[0], "recurve");
  assert.equal(queue.length, DEFAULT_PLAN.queue.length);
  assert.equal(DEFAULT_PLAN.queue[0], "consecrator");
});

test("moveInQueue ignores a move off either end", () => {
  assert.deepEqual(moveInQueue(DEFAULT_PLAN.queue, "consecrator", -1), DEFAULT_PLAN.queue);
  assert.deepEqual(moveInQueue(DEFAULT_PLAN.queue, "soulmine", 9), DEFAULT_PLAN.queue);
});

test("levelFor prefers the Forever level the Armoury synced", () => {
  const recurve = DEFAULT_PLAN.characters.find((c) => c.id === "recurve")!;
  const summaries = [
    { game: "forever" as const, name: "Recurve", status: "ok" as const, level: 31, lastSuccessAt: "2026-11-18T14:17:00.000Z" },
    { game: "retail" as const, name: "Consecrator", status: "ok" as const, level: 80, lastSuccessAt: "2026-11-18T14:17:00.000Z" },
  ];
  assert.deepEqual(levelFor(recurve, summaries), { level: 31, synced: true });
  const consecrator = DEFAULT_PLAN.characters.find((c) => c.id === "consecrator")!;
  // Only the retail Consecrator has data, so the planned level stands.
  assert.deepEqual(levelFor(consecrator, summaries), { level: consecrator.level, synced: false });
});

function memoryStore(initial?: unknown) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(PLAN_KEY, JSON.stringify(initial));
  return {
    data,
    async get(key: string) { const v = data.get(key); return v === undefined ? null : JSON.parse(v); },
    async put(key: string, value: string) { data.set(key, value); },
  };
}
const NOW = new Date("2026-11-19T01:00:00.000Z");

test("savePlan writes over the plan it was based on and stamps it", async () => {
  const store = memoryStore();
  const next = clone();
  next.queue = moveInQueue(next.queue, "recurve", 0);
  const result = await savePlan(store, DEFAULT_PLAN.updatedAt, next, NOW);
  assert.equal(result.ok, true);
  const stored = JSON.parse(store.data.get(PLAN_KEY)!);
  assert.equal(stored.updatedAt, NOW.toISOString());
  assert.equal(stored.queue[0], "recurve");
});

test("savePlan refuses an edit made on an older copy and returns the stored plan", async () => {
  const newer = { ...clone(), updatedAt: "2026-11-19T00:30:00.000Z" };
  const store = memoryStore(newer);
  const result = await savePlan(store, DEFAULT_PLAN.updatedAt, clone(), NOW);
  assert.deepEqual(result, { ok: false, status: 409, error: "the plan changed since this page loaded", plan: newer });
  assert.equal(JSON.parse(store.data.get(PLAN_KEY)!).updatedAt, newer.updatedAt);
});

test("readPlan falls back to the default when the stored plan is missing or invalid", async () => {
  assert.equal(await readPlan(memoryStore()), DEFAULT_PLAN);
  assert.equal(await readPlan(memoryStore({ junk: true })), DEFAULT_PLAN);
  assert.equal(await readPlan(null), DEFAULT_PLAN);
});
