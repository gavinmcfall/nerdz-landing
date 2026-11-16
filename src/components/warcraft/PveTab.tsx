import type { KeystoneRun, PveGroup, PveInstance, PveView } from "@/lib/warcraft/types";
import { expansionSummary, formatEarned, keystoneTime } from "@/lib/warcraft/format";

export function PveTab({ view }: { view: PveView | null }) {
  if (!view) {
    return (
      <div className="wow-soon">
        <p>No dungeon or raid data yet. It appears after the next nightly sync.</p>
      </div>
    );
  }

  return (
    <div className="wow-pve">
      {view.mythicPlus && <MythicPlus rating={view.mythicPlus.rating} season={view.mythicSeason ?? null} />}
      <PveSection title="Raids" noun="raid" groups={view.raids} />
      <PveSection title="Dungeons" noun="dungeon" groups={view.dungeons} />
    </div>
  );
}

function PveSection({ title, noun, groups }: { title: string; noun: "raid" | "dungeon"; groups: PveGroup[] }) {
  const id = `wow-pve-${noun}s`;
  return (
    <section className="wow-pve__section" aria-labelledby={id}>
      <h2 id={id} className="wow-h2">
        {title}
      </h2>
      {groups.length === 0 ? (
        <p className="wow-spec__muted">No {noun} kills recorded.</p>
      ) : (
        // The newest expansion starts open; the rest are a click away.
        groups.map((g, i) => (
          <details key={g.id} className="wow-pve__group" open={i === 0}>
            <summary className="wow-pve__summary">
              <span className="wow-pve__expansion">{g.name}</span>
              <span className="wow-pve__count">{expansionSummary(g.instances, noun)}</span>
            </summary>
            <ul className="wow-pve__list">
              {g.instances.map((instance) => (
                <InstanceRow key={instance.id} instance={instance} />
              ))}
            </ul>
          </details>
        ))
      )}
    </section>
  );
}

function InstanceRow({ instance }: { instance: PveInstance }) {
  return (
    <li className="wow-pve__row">
      <span className="wow-pve__name">{instance.name}</span>
      <ul className="wow-pve__modes" aria-label={`${instance.name} progress`}>
        {instance.modes.map((m) => (
          <li key={m.difficulty} className={`wow-pve__mode${m.total > 0 && m.completed >= m.total ? " wow-pve__mode--done" : ""}`}>
            {m.difficulty} <span className="wow-pve__kills">{m.completed}/{m.total}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

function MythicPlus({ rating, season }: { rating: number | null; season: { color: string | null; runs: KeystoneRun[] } | null }) {
  const runs = season?.runs ?? [];
  return (
    <section className="wow-pve__section" aria-labelledby="wow-pve-mplus">
      <h2 id="wow-pve-mplus" className="wow-h2">
        Mythic+ this season
      </h2>
      {rating == null ? (
        <p className="wow-spec__muted">No Mythic+ rating this season.</p>
      ) : (
        <p className="wow-pve__rating">
          {season?.color && <span className="wow-pve__dot" style={{ background: season.color }} aria-hidden="true" />}
          <span className="wow-panel__big">{rating.toLocaleString("en-US")}</span>
          <span className="wow-spec__muted">rating</span>
        </p>
      )}
      {runs.length > 0 && (
        <div className="wow-table-scroll">
          <table className="wow-table">
            <thead>
              <tr>
                <th scope="col">Dungeon</th>
                <th scope="col">Key</th>
                <th scope="col">Time</th>
                <th scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.dungeon}>
                  <th scope="row">
                    {run.dungeon}
                    <span className="wow-rep__detail"> · {formatEarned(run.completedAt)}</span>
                  </th>
                  <td>
                    +{run.level}
                    {!run.timed && <span className="wow-pve__over">over time</span>}
                  </td>
                  <td>{keystoneTime(run.duration)}</td>
                  <td>{run.score.toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
