import Link from "next/link";
import type { Summary } from "@/lib/warcraft/types";
import { characterHref } from "@/lib/warcraft/resolve";
import { classSlug } from "@/lib/warcraft/format";
import { FactionBadge, GameBadge } from "./Badges";

export function CharacterName({ summary }: { summary: Summary }) {
  return (
    <>
      {summary.name}
      {summary.surname && <span className="wow-surname"> {summary.surname}</span>}
    </>
  );
}

export function RosterCard({ summary }: { summary: Summary }) {
  if (summary.status === "not-listed") {
    return (
      <div className="wow-card wow-card--pending">
        <span className="wow-card__pending-tag">not listed yet</span>
        <div className="wow-card__pending-body">
          <span className="wow-card__name">
            <CharacterName summary={summary} />
          </span>
          <span className="wow-card__line">Appears in Blizzard&rsquo;s API at level 10</span>
        </div>
      </div>
    );
  }

  const line = [summary.level, summary.race, summary.spec, summary.characterClass].filter(Boolean).join(" ");
  return (
    <Link href={characterHref(summary.route)} className="wow-card" data-class={classSlug(summary.characterClass)}>
      <div className="wow-card__art">
        {summary.inset && <img src={summary.inset} alt="" loading="lazy" />}
        <span className="wow-card__stripe" aria-hidden="true" />
      </div>
      <div className="wow-card__body">
        <div className="wow-card__top">
          <span className="wow-card__name">
            <CharacterName summary={summary} />
          </span>
          {summary.itemLevel != null && <span className="wow-card__ilvl">{summary.itemLevel} ilvl</span>}
        </div>
        <span className="wow-card__line">{line}</span>
        <div className="wow-badges">
          <FactionBadge faction={summary.faction} />
          <GameBadge summary={summary} />
        </div>
      </div>
    </Link>
  );
}
