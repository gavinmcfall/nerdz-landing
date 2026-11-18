import { z } from "zod";

// The WoW Forever plan: which alt to level next, each character's spec and
// dual spec, and the professions spread across them. Stored as one document
// in the WOW_ARMORY KV namespace (key PLAN_KEY) and edited only by the
// people in EDITORS_KEY. Shared by the API route (validation) and the page.

export const PLAN_KEY = "plan:forever";
export const EDITORS_KEY = "warcraft:editors";
export type EditorsDoc = { v: 1; editors: { uid: string; name: string }[] };

export const DUAL_SPEC_LEVEL = 40;
export const MAX_LEVEL = 60;

export const SPECS = {
  Druid: ["Balance", "Feral", "Restoration"],
  Hunter: ["Beast Mastery", "Marksmanship", "Survival"],
  Mage: ["Arcane", "Fire", "Frost"],
  Paladin: ["Holy", "Protection", "Retribution"],
  Priest: ["Discipline", "Holy", "Shadow"],
  Rogue: ["Assassination", "Combat", "Subtlety"],
  Shaman: ["Elemental", "Enhancement", "Restoration"],
  Warlock: ["Affliction", "Demonology", "Destruction"],
  Warrior: ["Arms", "Fury", "Protection"],
} as const;
export type PlanClass = keyof typeof SPECS;
const CLASSES = Object.keys(SPECS) as PlanClass[];

export type Role = "Tank" | "Healer" | "Melee" | "Ranged";
const ROLES: Record<string, Role> = {
  "Druid:Balance": "Ranged", "Druid:Feral": "Tank", "Druid:Restoration": "Healer",
  "Paladin:Holy": "Healer", "Paladin:Protection": "Tank", "Paladin:Retribution": "Melee",
  "Priest:Discipline": "Healer", "Priest:Holy": "Healer", "Priest:Shadow": "Ranged",
  "Shaman:Elemental": "Ranged", "Shaman:Enhancement": "Melee", "Shaman:Restoration": "Healer",
  "Warrior:Arms": "Melee", "Warrior:Fury": "Melee", "Warrior:Protection": "Tank",
};
export function roleOf(cls: PlanClass, spec: string): Role {
  return ROLES[`${cls}:${spec}`] ?? (cls === "Rogue" ? "Melee" : "Ranged");
}

export const GATHERING = ["Mining", "Herbalism", "Skinning"] as const;
export const PRIMARY = ["Mining", "Herbalism", "Skinning", "Blacksmithing", "Engineering", "Leatherworking", "Alchemy", "Tailoring", "Enchanting"] as const;
export const SECONDARY = ["Cooking", "First Aid", "Fishing"] as const;
export const SPECIALIZATIONS: Record<string, readonly string[]> = {
  Blacksmithing: ["Armorsmith", "Weaponsmith"],
  Engineering: ["Gnomish", "Goblin"],
  Leatherworking: ["Dragonscale", "Elemental", "Tribal"],
};
// Where a crafter's main materials come from; null when no gatherer supplies them.
export const FED_BY: Record<string, string | null> = {
  Blacksmithing: "Mining", Engineering: "Mining", Leatherworking: "Skinning", Alchemy: "Herbalism",
  Tailoring: null, Enchanting: null,
};
export const SUPPLY_NOTE: Record<string, string> = {
  Tailoring: "Cloth drops from mobs",
  Enchanting: "Disenchants spare gear",
};

const ProfSchema = z.object({
  p: z.enum(["", ...PRIMARY]),
  s: z.string().max(40),
});

const CharacterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  name: z.string().min(1).max(40),
  cls: z.enum(CLASSES as [PlanClass, ...PlanClass[]]),
  race: z.string().max(60),
  level: z.number().int().min(1).max(MAX_LEVEL),
  spec: z.string(),
  dual: z.string(),
  profs: z.tuple([ProfSchema, ProfSchema]),
  secondary: z.array(z.enum(SECONDARY)).max(SECONDARY.length),
  notes: z.string().max(2000),
});

export const PlanSchema = z
  .object({
    v: z.literal(1),
    updatedAt: z.string(),
    queue: z.array(z.string()),
    characters: z.array(CharacterSchema).min(1).max(60),
  })
  .superRefine((plan, ctx) => {
    const ids = plan.characters.map((c) => c.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "duplicate character id" });
    const queued = [...plan.queue].sort().join();
    if (plan.queue.length !== ids.length || queued !== [...ids].sort().join()) {
      ctx.addIssue({ code: "custom", message: "queue must list each character once" });
    }
    for (const c of plan.characters) {
      const specs: readonly string[] = SPECS[c.cls];
      if (!specs.includes(c.spec) || !specs.includes(c.dual)) {
        ctx.addIssue({ code: "custom", message: `${c.name}: spec not in ${c.cls}` });
      }
      const [a, b] = c.profs;
      if (a.p && a.p === b.p) ctx.addIssue({ code: "custom", message: `${c.name}: same profession twice` });
      for (const pr of c.profs) {
        if (pr.s && !(SPECIALIZATIONS[pr.p] ?? []).includes(pr.s)) {
          ctx.addIssue({ code: "custom", message: `${c.name}: ${pr.s} is not a ${pr.p || "profession"} specialization` });
        }
      }
    }
  });

export type Plan = z.infer<typeof PlanSchema>;
export type PlanCharacter = Plan["characters"][number];
export type PlanProf = PlanCharacter["profs"][number];

export function parsePlan(value: unknown): Plan | null {
  const parsed = PlanSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

// One row of the coverage table.
export type CoverageRow = {
  profession: string;
  holders: { id: string; name: string; cls: PlanClass; specialization: string }[];
  supply:
    | { gatherer: string; covered: boolean; selfSupplied: boolean }
    | { feeds: string[] }
    | { note: string };
  specializations: { name: string; taken: boolean }[];
};

export function coverage(plan: Plan): CoverageRow[] {
  const holdersOf = (p: string) =>
    plan.characters
      .filter((c) => c.profs.some((pr) => pr.p === p))
      .map((c) => ({ id: c.id, name: c.name, cls: c.cls, specialization: c.profs.find((pr) => pr.p === p)!.s }));
  return PRIMARY.map((profession) => {
    const holders = holdersOf(profession);
    let supply: CoverageRow["supply"];
    if ((GATHERING as readonly string[]).includes(profession)) {
      supply = { feeds: Object.keys(FED_BY).filter((craft) => FED_BY[craft] === profession) };
    } else if (FED_BY[profession]) {
      const gatherer = FED_BY[profession]!;
      const selfSupplied =
        holders.length > 0 &&
        holders.every((h) => plan.characters.find((c) => c.id === h.id)!.profs.some((pr) => pr.p === gatherer));
      supply = { gatherer, covered: holdersOf(gatherer).length > 0, selfSupplied };
    } else {
      supply = { note: SUPPLY_NOTE[profession] ?? "" };
    }
    const taken = holders.map((h) => h.specialization);
    const specializations = (SPECIALIZATIONS[profession] ?? []).map((name) => ({ name, taken: taken.includes(name) }));
    return { profession, holders, supply, specializations };
  });
}

export type RoleEntry = { id: string; name: string; cls: PlanClass; spec: string; dual: boolean };

export function roleGroups(plan: Plan): Record<Role, RoleEntry[]> {
  const groups: Record<Role, RoleEntry[]> = { Tank: [], Healer: [], Melee: [], Ranged: [] };
  for (const c of plan.characters) {
    groups[roleOf(c.cls, c.spec)].push({ id: c.id, name: c.name, cls: c.cls, spec: c.spec, dual: false });
    if (c.dual !== c.spec) groups[roleOf(c.cls, c.dual)].push({ id: c.id, name: c.name, cls: c.cls, spec: c.dual, dual: true });
  }
  return groups;
}

/** A new queue with `id` moved to position `to`; the same queue if the move is out of range. */
export function moveInQueue(queue: string[], id: string, to: number): string[] {
  const from = queue.indexOf(id);
  if (from < 0 || to < 0 || to >= queue.length || from === to) return queue;
  const next = [...queue];
  next.splice(from, 1);
  next.splice(to, 0, id);
  return next;
}

type SyncedSummary = { game: string; name: string; status: string; level?: number; lastSuccessAt?: string };

/** The level the Armoury synced for this Forever character, else the planned one. */
export function levelFor(c: PlanCharacter, summaries: SyncedSummary[]): { level: number; synced: boolean } {
  const s = summaries.find((x) => x.game === "forever" && x.name === c.name && x.lastSuccessAt && typeof x.level === "number");
  return s ? { level: s.level!, synced: true } : { level: c.level, synced: false };
}

const prof = (p: PlanProf["p"], s = ""): PlanProf => ({ p, s });
const char = (
  id: string, name: string, cls: PlanClass, race: string, level: number,
  spec: string, dual: string, profs: [PlanProf, PlanProf], notes = "",
  secondary: PlanCharacter["secondary"] = ["Cooking", "First Aid"],
): PlanCharacter => ({ id, name, cls, race, level, spec, dual, profs, secondary, notes });

// The plan before the first save, taken from the local planner of 19 Nov 2026.
export const DEFAULT_PLAN: Plan = {
  v: 1,
  updatedAt: "2026-11-18T20:00:00.000Z",
  queue: ["consecrator", "valewarden", "abracadaddy", "recurve", "vengeance", "thunderbuddy", "eviscerator", "nihilist", "soulmine"],
  characters: [
    char("consecrator", "Consecrator", "Paladin", "Human male", 3, "Retribution", "Holy",
      [prof("Mining"), prof("Blacksmithing", "Armorsmith")], "Main. Mines for its own Blacksmithing.", ["Cooking", "First Aid", "Fishing"]),
    char("valewarden", "Valewarden", "Druid", "High-Order Skyborne male", 1, "Feral", "Restoration",
      [prof("Herbalism"), prof("Alchemy")], "Potions and flasks for everyone."),
    char("abracadaddy", "Abracadaddy", "Mage", "High-Order Skyborne female", 1, "Arcane", "Fire",
      [prof("Tailoring"), prof("Enchanting")], "Bags and enchants. Disenchants the alts' spare gear."),
    char("recurve", "Recurve", "Hunter", "High-Order Skyborne male", 26, "Beast Mastery", "Survival",
      [prof("Skinning"), prof("Leatherworking", "Dragonscale")], "Professions already learned."),
    char("vengeance", "Vengeance", "Warrior", "Night Elf male", 1, "Fury", "Protection",
      [prof("Mining"), prof("Blacksmithing", "Weaponsmith")]),
    char("thunderbuddy", "Thunderbuddy", "Shaman", "Dwarf male", 1, "Enhancement", "Restoration",
      [prof("Skinning"), prof("Leatherworking", "Elemental")], "Dwarf is the only Alliance Shaman race."),
    char("eviscerator", "Eviscerator", "Rogue", "Night Elf male", 1, "Combat", "Subtlety",
      [prof("Mining"), prof("Engineering", "Gnomish")]),
    char("nihilist", "Nihilist", "Priest", "Night Elf female", 1, "Shadow", "Holy",
      [prof("Herbalism"), prof("Tailoring")], "Second herbalist, feeds Valewarden's Alchemy."),
    char("soulmine", "Soulmine", "Warlock", "Human male", 1, "Demonology", "Affliction",
      [prof("Mining"), prof("Engineering", "Goblin")]),
  ],
};

// The slice of a KV namespace the plan needs, so storage can be faked in tests.
export type PlanStore = {
  get(key: string, type: "json"): Promise<unknown>;
  put(key: string, value: string): Promise<void>;
};

/** The stored plan, or the default before the first save or if it can't be read. */
export async function readPlan(store: PlanStore | null): Promise<Plan> {
  if (!store) return DEFAULT_PLAN;
  return parsePlan(await store.get(PLAN_KEY, "json")) ?? DEFAULT_PLAN;
}

export type SaveResult = { ok: true; plan: Plan } | { ok: false; status: 409; error: string; plan: Plan };

/**
 * Replaces the stored plan if `base` is the updatedAt of the plan currently
 * stored, so an edit made on an older copy can't overwrite newer ones.
 */
export async function savePlan(store: PlanStore, base: string, next: Plan, now = new Date()): Promise<SaveResult> {
  const current = await readPlan(store);
  if (current.updatedAt !== base) {
    return { ok: false, status: 409, error: "the plan changed since this page loaded", plan: current };
  }
  const saved: Plan = { ...next, updatedAt: now.toISOString() };
  await store.put(PLAN_KEY, JSON.stringify(saved));
  return { ok: true, plan: saved };
}
