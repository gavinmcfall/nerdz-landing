// Shared data shape for the hub (cockpit) index. Serializable so it can
// cross the server→client boundary.
export type ManualCard = {
  slug: string;
  title: string;
  summary: string;
  type: string;
  paper: string;
  category: string;
  updated: string;
};

export function groupByCategory(
  manuals: ManualCard[],
): [string, ManualCard[]][] {
  const by: Record<string, ManualCard[]> = {};
  for (const m of manuals) (by[m.category] ??= []).push(m);
  return Object.entries(by).sort(([a], [b]) => a.localeCompare(b));
}
