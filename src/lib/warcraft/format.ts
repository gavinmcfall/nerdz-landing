// Small display helpers for the warcraft pages. Import-free so they run
// under `node --test`.

const NZ = new Intl.DateTimeFormat("en-NZ", {
  timeZone: "Pacific/Auckland",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZoneName: "short",
});

// "17 nov · 03:17 nzdt", in New Zealand time; null for a missing or bad date.
export function formatSynced(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    NZ.formatToParts(date).find((p) => p.type === type)?.value ?? "";
  return `${part("day")} ${part("month")} · ${part("hour")}:${part("minute")} ${part("timeZoneName")}`.toLowerCase();
}

type SyncState = { status: string; lastSuccessAt?: string };

// Whether a character has synced successfully at least once, so has a page
// to link to. A not-listed character whose profile later errors has none.
export function hasData(s: SyncState): boolean {
  return s.status !== "not-listed" && Boolean(s.lastSuccessAt);
}

// "data from 16 nov · 03:17 nzdt" when the last sync failed and the page is
// showing older data; otherwise null.
export function staleNote(s: SyncState): string | null {
  if (s.status !== "error") return null;
  const when = formatSynced(s.lastSuccessAt);
  return when ? `data from ${when}` : null;
}

type Focus = { x: number; top: number; height: number };

const pct = (n: number) => `${Math.round(n * 1e4) / 1e4}%`;

// Positions a character's full render inside a frame so the sync's focus
// window (fractions of the image) fills it: scale the image so the window's
// height is the frame's, lift it by the window's top, and centre the figure.
export function portraitStyle(f: Focus) {
  return {
    height: pct(100 / f.height),
    top: pct((-100 * f.top) / f.height),
    left: "50%",
    transform: `translateX(${pct(-100 * f.x)})`,
  };
}

// The Character tab's centrepiece: the whole figure, scaled to fill the
// frame's height, standing in its class's Armory background. Null for an
// index written before the sync measured the figure (2.2); the tab then
// shows the render as it comes.
export function dollScene(summary: {
  portrait?: { url: string; focus: Focus; figure?: Focus } | null;
  background?: string | null;
}) {
  const portrait = summary.portrait;
  if (!portrait?.figure) return null;
  return { url: portrait.url, background: summary.background ?? null, stageStyle: portraitStyle(portrait.figure) };
}

// "Demon Hunter" → "demon-hunter", for the data-class attribute the CSS
// colours by.
export function classSlug(name: string | null | undefined): string {
  return name ? name.toLowerCase().replace(/[^a-z]+/g, "-") : "unknown";
}

// Highest level first, then highest item level.
export function sortRetail<T extends { level?: number; itemLevel?: number | null }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => (b.level ?? 0) - (a.level ?? 0) || (b.itemLevel ?? 0) - (a.itemLevel ?? 0),
  );
}

type FactionStanding = {
  value: number;
  max: number;
  paragon: { value: number; max: number } | null;
};

const count = (n: number) => n.toLocaleString("en-US");

// A reputation bar: how far through the current standing, and the numbers
// to show. At the top standing (0 of 0) the bar is full, unless the faction
// has paragon progress, which then takes over the bar.
export function reputationProgress(f: FactionStanding): { percent: number; detail: string | null } {
  if (f.paragon && f.paragon.max > 0) {
    return {
      percent: Math.round((100 * f.paragon.value) / f.paragon.max),
      detail: `Paragon ${count(f.paragon.value)} / ${count(f.paragon.max)}`,
    };
  }
  if (f.max <= 0) return { percent: 100, detail: null };
  return { percent: Math.round((100 * f.value) / f.max), detail: `${count(f.value)} / ${count(f.max)}` };
}

// The Reputation tab's filter: factions whose name contains the query, or a
// whole group when the group's name does. Groups left empty are dropped.
export function filterReputation<G extends { name: string; factions: { name: string }[] }>(groups: G[], query: string): G[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) =>
      g.name.toLowerCase().includes(q) ? g : { ...g, factions: g.factions.filter((f) => f.name.toLowerCase().includes(q)) },
    )
    .filter((g) => g.factions.length > 0);
}

const NZ_DAY = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Pacific/Auckland",
  day: "numeric",
  month: "short",
  year: "numeric",
});

// "18 Feb 2026": the day an achievement was earned, in New Zealand; null for
// a bad date.
export function formatEarned(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return NZ_DAY.format(date);
}

// How much of an achievement category the character has done, as a whole
// percentage. Blizzard's counts can run past the total (removed
// achievements still count), so it stops at 100.
export function categoryProgress(quantity: number, total: { quantity: number; points: number } | null): number {
  if (!total || total.quantity <= 0) return 0;
  return Math.min(100, Math.round((100 * quantity) / total.quantity));
}

// The Achievements tab's filter: achievements whose name contains the query.
export function filterAchievements<A extends { name: string }>(list: A[], query: string): A[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((a) => a.name.toLowerCase().includes(q));
}

const COLLECTION_NOUNS: Record<string, [string, string]> = {
  pets: ["unique pet", "unique pets"],
  mounts: ["mount", "mounts"],
  toys: ["toy", "toys"],
  heirlooms: ["heirloom", "heirlooms"],
};

// "256 unique pets", "1 toy", "No heirlooms".
export function collectionCount(collection: "pets" | "mounts" | "toys" | "heirlooms", n: number): string {
  const [one, many] = COLLECTION_NOUNS[collection];
  if (n === 0) return `No ${many.replace("unique ", "")}`;
  return `${count(n)} ${n === 1 ? one : many}`;
}

// "3 raids · 2 cleared", "1 dungeon · cleared", "1 raid": how many
// instances an expansion group holds, and how many have every boss down on
// at least one difficulty.
export function expansionSummary(instances: { modes: { completed: number; total: number }[] }[], noun: "raid" | "dungeon"): string {
  const n = instances.length;
  const cleared = instances.filter((i) => i.modes.some((m) => m.total > 0 && m.completed >= m.total)).length;
  const head = `${count(n)} ${n === 1 ? noun : `${noun}s`}`;
  if (cleared === 0) return head;
  return `${head} · ${n === 1 ? "cleared" : `${count(cleared)} cleared`}`;
}

// "50%": the share of games won. A dash when none were played.
export function winRate({ played, won }: { played: number; won: number }): string {
  if (played <= 0) return "–";
  return `${Math.round((100 * won) / played)}%`;
}

// An earned achievement with its points, category and icon from the view's
// details map, each null when the sync hasn't looked it up.
export function withDetails(
  a: { id: number; name: string; completedAt: string },
  details: Record<string, { points: number; category: string | null; icon: string | null }> | undefined,
) {
  const d = details?.[a.id];
  return { ...a, points: d?.points ?? null, category: d?.category ?? null, icon: d?.icon ?? null };
}

// A keystone run's time: "24:57", or "1:02:05" past an hour. Seconds are
// rounded down, as the game shows them.
export function keystoneTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

// Wowhead's thumbnail of the model in a Blizzard creature render: a 300px
// PNG on a transparent background, framed to the mount rather than leaving
// it small on black. Not an official API, so callers fall back to the
// Blizzard render when it fails to load. Null for any other picture.
export function mountRender(icon: string | null): string | null {
  const id = Number(icon?.match(/\/creature-display-(\d+)\.jpg$/)?.[1]);
  if (!id) return null;
  return `https://wow.zamimg.com/modelviewer/live/webthumbs/npc/${id % 256}/${id}.png`;
}
