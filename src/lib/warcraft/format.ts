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
