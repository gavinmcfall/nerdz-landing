import type { Summary } from "@/lib/warcraft/types";

export function FactionBadge({ faction }: { faction: Summary["faction"] }) {
  if (!faction) return null;
  const horde = faction === "HORDE";
  return (
    <span className={`wow-badge ${horde ? "wow-badge--horde" : "wow-badge--alliance"}`}>
      {horde ? "Horde" : "Alliance"}
    </span>
  );
}

// "Retail · Barthilas" or "Forever · Normal" (the Forever play style, shown
// exactly as Blizzard names it).
export function GameBadge({ summary }: { summary: Summary }) {
  const where = summary.game === "retail" ? summary.realm : summary.ruleset;
  return (
    <span className="wow-badge wow-badge--game">
      {summary.game === "retail" ? "Retail" : "Forever"}
      {where ? ` · ${where}` : ""}
    </span>
  );
}
