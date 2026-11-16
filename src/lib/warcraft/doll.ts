// Paper-doll layout and raid summary for the Character tab. Pure, so it
// runs under `node --test`.
import type { Game, RaidProgress } from "./types";

const LEFT = ["HEAD", "NECK", "SHOULDER", "BACK", "CHEST", "SHIRT", "TABARD", "WRIST"];
const RIGHT = ["HANDS", "WAIST", "LEGS", "FEET", "FINGER_1", "FINGER_2", "TRINKET_1", "TRINKET_2"];
const WEAPONS = ["MAIN_HAND", "OFF_HAND"];
const FOREVER_EXTRA = ["RANGED", "AMMO"];

// Labels for empty slots; a filled slot uses the API's own slot name.
const SLOT_LABELS: Record<string, string> = {
  HEAD: "Head", NECK: "Neck", SHOULDER: "Shoulder", BACK: "Back", CHEST: "Chest",
  SHIRT: "Shirt", TABARD: "Tabard", WRIST: "Wrist", HANDS: "Hands", WAIST: "Waist",
  LEGS: "Legs", FEET: "Feet", FINGER_1: "Ring 1", FINGER_2: "Ring 2",
  TRINKET_1: "Trinket 1", TRINKET_2: "Trinket 2", MAIN_HAND: "Main Hand",
  OFF_HAND: "Off Hand", RANGED: "Ranged", AMMO: "Ammo",
};

export type DollSlot<T> = { slot: string; label: string; item: T | null };

export function layoutSlots<T extends { slot: string; slotName: string }>(equipment: T[], game: Game) {
  const bySlot = new Map(equipment.map((i) => [i.slot, i]));
  const column = (slots: string[]): DollSlot<T>[] =>
    slots.map((slot) => {
      const item = bySlot.get(slot) ?? null;
      return { slot, label: item?.slotName ?? SLOT_LABELS[slot] ?? slot, item };
    });
  return {
    left: column(LEFT),
    right: column(RIGHT),
    bottom: column(game === "forever" ? [...WEAPONS, ...FOREVER_EXTRA] : WEAPONS),
  };
}

const DIFFICULTY_SHORT: Record<string, string> = { "Raid Finder": "LFR", Normal: "N", Heroic: "H", Mythic: "M" };

type Mode = RaidProgress["instances"][number]["modes"][number];

// "3/8 H": the hardest difficulty with at least one kill. The API lists
// modes easiest first. Null when nothing has been killed.
export function bestRaidMode(modes: Mode[]): string | null {
  const best = [...modes].reverse().find((m) => m.completed > 0);
  if (!best) return null;
  return `${best.completed}/${best.total} ${DIFFICULTY_SHORT[best.difficulty] ?? best.difficulty}`;
}

export function raidRows(raids: RaidProgress | null): { name: string; progress: string }[] {
  return (raids?.instances ?? []).flatMap((i) => {
    const progress = bestRaidMode(i.modes);
    return progress ? [{ name: i.name, progress }] : [];
  });
}
