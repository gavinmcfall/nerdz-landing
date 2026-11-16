import type { Summary } from "@/lib/warcraft/types";
import { classSlug, formatSynced } from "@/lib/warcraft/format";
import { FactionBadge, GameBadge } from "./Badges";
import { CharacterName } from "./RosterCard";

export function CharacterHeader({ summary }: { summary: Summary }) {
  const updated = formatSynced(summary.lastSuccessAt);
  return (
    <section className="wow-head" aria-label="Character header">
      <div className="wow-head__id">
        <div className="wow-badges">
          <FactionBadge faction={summary.faction} />
          <GameBadge summary={summary} />
        </div>
        <h1 className="wow-head__name">
          <CharacterName summary={summary} />
        </h1>
        {summary.title && <p className="wow-head__title">{summary.title}</p>}
        <p className="wow-head__line" data-class={classSlug(summary.characterClass)}>
          {[summary.level, summary.race, summary.spec].filter(Boolean).join(" ")}{" "}
          <span className="wow-head__class">{summary.characterClass}</span>
          {summary.guild && <span className="wow-head__guild"> ‹{summary.guild}›</span>}
        </p>
        {summary.status === "error" && updated && (
          <p className="wow-head__stale">Blizzard&rsquo;s API didn&rsquo;t answer last night: data from {updated}.</p>
        )}
      </div>
      <dl className="wow-head__stats">
        {summary.game === "retail" && (
          <div>
            <dt>Achievements</dt>
            <dd className="wow-head__ach">{(summary.achievementPoints ?? 0).toLocaleString("en-US")}</dd>
          </div>
        )}
        {summary.itemLevel != null && (
          <div>
            <dt>Item level</dt>
            <dd>{summary.itemLevel}</dd>
          </div>
        )}
        {updated && (
          <div>
            <dt>Updated</dt>
            <dd className="wow-head__updated">{updated}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
