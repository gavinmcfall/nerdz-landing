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
