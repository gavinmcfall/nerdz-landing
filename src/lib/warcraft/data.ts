import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ArmoryIndex, CharacterView } from "./types";

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

export async function getCharacterView(key: string): Promise<CharacterView | null> {
  const store = await kv();
  if (!store) return null;
  for (const version of SUPPORTED_VIEW_VERSIONS) {
    const view = (await store.get(`view:v${version}:${key}:character`, "json")) as CharacterView | null;
    if (view && Array.isArray(view.equipment)) return view;
  }
  return null;
}
