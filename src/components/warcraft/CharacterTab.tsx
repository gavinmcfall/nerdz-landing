import type { CharacterView, Summary } from "@/lib/warcraft/types";
import { layoutSlots, raidRows } from "@/lib/warcraft/doll";
import { ItemSlot } from "./ItemSlot";

export function CharacterTab({ view, summary }: { view: CharacterView | null; summary: Summary }) {
  if (!view) {
    return (
      <div className="wow-soon">
        <p>No character data yet. It appears after the next nightly sync.</p>
      </div>
    );
  }
  const { left, right, bottom } = layoutSlots(view.equipment, view.game);
  const alt = `${summary.name}, ${[summary.race, summary.characterClass].filter(Boolean).join(" ")}, in current gear`;

  return (
    <>
      <section className="wow-doll" aria-label="Equipment">
        <ul className="wow-doll__col">
          {left.map((s) => (
            <li key={s.slot}>
              <ItemSlot item={s.item} label={s.label} side="left" />
            </li>
          ))}
        </ul>
        <figure className="wow-doll__render">{view.render && <img src={view.render} alt={alt} />}</figure>
        <ul className="wow-doll__col">
          {right.map((s) => (
            <li key={s.slot}>
              <ItemSlot item={s.item} label={s.label} side="right" />
            </li>
          ))}
        </ul>
      </section>
      <ul className="wow-doll__weapons" aria-label="Weapons">
        {bottom.map((s) => (
          <li key={s.slot}>
            <ItemSlot item={s.item} label={s.label} side="bottom" />
          </li>
        ))}
      </ul>

      {view.stats.length > 0 && (
        <section className="wow-stats" aria-label="Stats">
          {view.stats.map((s) => (
            <div key={s.label} className="wow-stats__cell">
              <span className="wow-stats__value">{s.value}</span>
              <span className="wow-stats__label">{s.label}</span>
            </div>
          ))}
        </section>
      )}

      <SpecCards view={view} />
      <SummaryPanels view={view} />
    </>
  );
}

function SpecCards({ view }: { view: CharacterView }) {
  if (view.specs.length === 0) return null;
  return (
    <section aria-labelledby="wow-specs">
      <h2 id="wow-specs" className="wow-h2">
        Specialisation
      </h2>
      <div className="wow-specs">
        {view.specs.map((s) => (
          <div key={s.name} className={`wow-panel wow-spec${s.active ? " wow-spec--active" : ""}`}>
            <span className="wow-spec__state">{s.active ? "Active" : "Inactive"}</span>
            <span className="wow-spec__name">{s.name}</span>
            {s.spentPoints != null && (
              <span className="wow-spec__line">
                {s.spentPoints} talent point{s.spentPoints === 1 ? "" : "s"}
              </span>
            )}
            {s.heroTalent && (
              <span className="wow-spec__line">
                Hero talent · <strong>{s.heroTalent}</strong>
              </span>
            )}
            {s.pvpTalents.length > 0 && (
              <span className="wow-spec__muted">
                {s.pvpTalents.length} PvP talent{s.pvpTalents.length === 1 ? "" : "s"} selected
              </span>
            )}
            {view.game === "retail" && !s.active && !s.heroTalent && s.pvpTalents.length === 0 && (
              <span className="wow-spec__muted">Not selected</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryPanels({ view }: { view: CharacterView }) {
  const raids = raidRows(view.raids);
  return (
    <div className="wow-panels">
      {view.mythicPlus && (
        <section className="wow-panel" aria-labelledby="wow-mplus">
          <h2 id="wow-mplus" className="wow-h2">
            Mythic+
          </h2>
          <span className="wow-panel__big">{view.mythicPlus.rating ?? 0}</span>
          {view.mythicPlus.rating == null && <span className="wow-spec__muted">No keystone runs this season.</span>}
        </section>
      )}
      <section className="wow-panel" aria-labelledby="wow-raids">
        <h2 id="wow-raids" className="wow-h2">
          Raid progression{view.raids && raids.length > 0 ? ` · ${view.raids.expansion}` : ""}
        </h2>
        {raids.length === 0 ? (
          <span className="wow-spec__muted">No raid kills recorded.</span>
        ) : (
          raids.map((r) => (
            <div key={r.name} className="wow-raid">
              <span>{r.name}</span>
              <span className="wow-raid__progress">{r.progress}</span>
            </div>
          ))
        )}
      </section>
      <section className="wow-panel" aria-labelledby="wow-pvp">
        <h2 id="wow-pvp" className="wow-h2">
          Player vs Player
        </h2>
        <div className="wow-pvp">
          {view.game === "retail" ? (
            <div>
              <span className="wow-panel__big">{view.pvp.honorLevel ?? 0}</span>
              <span className="wow-spec__muted">Honor level</span>
            </div>
          ) : (
            <div>
              <span className="wow-panel__big">{view.pvp.rank ?? 0}</span>
              <span className="wow-spec__muted">PvP rank</span>
            </div>
          )}
          <div>
            <span className="wow-panel__big">{view.pvp.honorableKills.toLocaleString("en-US")}</span>
            <span className="wow-spec__muted">Honourable kills</span>
          </div>
        </div>
      </section>
    </div>
  );
}
