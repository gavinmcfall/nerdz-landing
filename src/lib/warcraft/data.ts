import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ArmoryIndex, CharacterView, ReputationView } from "./types";

// Reads the WOW_ARMORY KV namespace written by wow-armoury-sync. Any missing
// binding, key or unexpected shape reads as null, so a page shows its "no
// data yet" state instead of failing.

// View versions this site can render, newest first. When the sync starts
// writing v2, add 2 here once the pages support it; until then the site
// keeps reading v1, which the sync writes alongside.
const SUPPORTED_VIEW_VERSIONS = [1];

async function kv() {
  try {
    return (await getCloudflareContext({ async: true })).env.WOW_ARMORY ?? null;
  } catch {
    return null;
  }
}

export async function getIndex(): Promise<ArmoryIndex | null> {
  const store = await kv();
  if (!store) return null;
  const index = (await store.get("index", "json")) as Partial<ArmoryIndex> | null;
  if (!index || typeof index.schemaVersion !== "number" || !Array.isArray(index.characters)) return null;
  return index as ArmoryIndex;
}

// The newest supported version of one of a character's views that passes
// `valid`, or null.
async function getView<T>(key: string, tab: string, valid: (view: T) => boolean): Promise<T | null> {
  const store = await kv();
  if (!store) return null;
  for (const version of SUPPORTED_VIEW_VERSIONS) {
    const view = (await store.get(`view:v${version}:${key}:${tab}`, "json")) as T | null;
    if (view && valid(view)) return view;
  }
  return null;
}

export function getCharacterView(key: string): Promise<CharacterView | null> {
  return getView<CharacterView>(key, "character", (v) => Array.isArray(v.equipment));
}

export function getReputationView(key: string): Promise<ReputationView | null> {
  return getView<ReputationView>(key, "reputation", (v) => Array.isArray(v.groups));
}
