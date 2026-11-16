import Link from "next/link";
import type { Summary } from "@/lib/warcraft/types";
import { characterHref } from "@/lib/warcraft/resolve";
import { classSlug, hasData, portraitStyle, staleNote } from "@/lib/warcraft/format";
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
  // No successful sync yet: nothing to show or link to.
  if (!hasData(summary)) {
    return (
      <div className="wow-card wow-card--pending">
        <span className="wow-card__pending-tag">{summary.status === "not-listed" ? "not listed yet" : "not synced yet"}</span>
        <div className="wow-card__pending-body">
          <span className="wow-card__name">
            <CharacterName summary={summary} />
          </span>
          <span className="wow-card__line">
            {summary.game === "forever" ? <>Appears in Blizzard&rsquo;s API at level 10</> : "Blizzard's API hasn't answered yet"}
          </span>
        </div>
      </div>
    );
  }

  const line = [summary.level, summary.race, summary.spec, summary.characterClass].filter(Boolean).join(" ");
  const stale = staleNote(summary);
  return (
    <Link href={characterHref(summary.route)} className="wow-card" data-class={classSlug(summary.characterClass)}>
      <div className="wow-card__art">
        {summary.portrait ? (
          <img
            className="wow-card__portrait"
            src={summary.portrait.url}
            alt=""
            loading="lazy"
            style={portraitStyle(summary.portrait.focus)}
          />
        ) : (
          summary.inset && <img className="wow-card__inset" src={summary.inset} alt="" loading="lazy" />
        )}
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
        {stale && <span className="wow-card__stale">{stale}</span>}
        <div className="wow-badges">
          <FactionBadge faction={summary.faction} />
          <GameBadge summary={summary} />
        </div>
      </div>
    </Link>
  );
}
