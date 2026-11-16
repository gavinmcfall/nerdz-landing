// Character page addresses under /lab/warcraft. Pure and import-free so it
// runs under `node --test` with Node's type stripping.
//
//   /lab/warcraft/retail/{realm}/{name}[/{tab}]
//   /lab/warcraft/forever/{name}-{surname}[/{tab}]
//
// The collections tab takes one more segment, the collection
// (…/collections/mounts); without it, it opens on pets.
//
// Segments are the sync's `route` values (lowercase, accents kept). The
// browser may send them encoded or not, so both forms match.

export const TABS = ["character", "achievements", "collections", "pve", "pvp", "reputation"] as const;
export type Tab = (typeof TABS)[number];

export const TAB_LABELS: Record<Tab, string> = {
  character: "Character",
  achievements: "Achievements",
  collections: "Collections",
  pve: "Dungeons & Raids",
  pvp: "Player vs Player",
  reputation: "Reputation",
};

export const COLLECTIONS = ["pets", "mounts", "toys", "heirlooms"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export const COLLECTION_LABELS: Record<Collection, string> = {
  pets: "Pets",
  mounts: "Mounts",
  toys: "Toys",
  heirlooms: "Heirlooms",
};

export type CharacterMatch = { index: number; tab: Tab; collection?: Collection };

// Decoded, NFC-normalised and lowercased; null when the encoding is malformed.
function normalise(segment: string): string | null {
  try {
    return decodeURIComponent(segment).normalize("NFC").toLowerCase();
  } catch {
    return null;
  }
}

export function resolveCharacterPath(
  characters: { route: string[] }[],
  segments: string[],
): CharacterMatch | null {
  const wanted = segments.map(normalise);
  if (wanted.some((s) => s === null)) return null;

  for (let index = 0; index < characters.length; index++) {
    const route = characters[index].route.map((s) => s.normalize("NFC").toLowerCase());
    if (wanted.length < route.length || wanted.length > route.length + 2) continue;
    if (!route.every((s, i) => s === wanted[i])) continue;
    if (wanted.length === route.length) return { index, tab: "character" };
    // "character" is the bare address; it has no second one with the tab named.
    const tab = TABS.find((t) => t !== "character" && t === wanted[route.length]);
    if (!tab) return null;
    if (tab === "collections") {
      const collection = wanted.length === route.length + 2 ? COLLECTIONS.find((c) => c === wanted[route.length + 1]) : "pets";
      return collection ? { index, tab, collection } : null;
    }
    return wanted.length === route.length + 1 ? { index, tab } : null;
  }
  return null;
}

export function characterHref(route: string[], tab: Tab = "character"): string {
  const base = `/lab/warcraft/${route.map(encodeURIComponent).join("/")}`;
  return tab === "character" ? base : `${base}/${tab}`;
}

export function collectionHref(route: string[], collection: Collection): string {
  return `${characterHref(route, "collections")}/${collection}`;
}
