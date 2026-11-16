import type { PvpView } from "@/lib/warcraft/types";
import { winRate } from "@/lib/warcraft/format";

const n = (value: number) => value.toLocaleString("en-US");

export function PvpTab({ view }: { view: PvpView | null }) {
  if (!view) {
    return (
      <div className="wow-soon">
        <p>No PvP data yet. It appears after the next nightly sync.</p>
      </div>
    );
  }

  return (
    <div className="wow-pvptab">
      <dl className="wow-ach__totals">
        {view.game === "retail" ? (
          <div>
            <dt>Honor level</dt>
            <dd>{n(view.honorLevel ?? 0)}</dd>
          </div>
        ) : (
          <div>
            <dt>Rank</dt>
            <dd>{n(view.rank ?? 0)}</dd>
          </div>
        )}
        <div>
          <dt>Honorable kills</dt>
          <dd>{n(view.honorableKills)}</dd>
        </div>
      </dl>

      {view.brackets.length > 0 && (
        <section aria-labelledby="wow-pvp-rated">
          <h2 id="wow-pvp-rated" className="wow-h2">
            Rated
          </h2>
          <ul className="wow-pvptab__brackets">
            {view.brackets.map((b) => (
              <li key={b.id} className="wow-panel">
                <span className="wow-pvptab__bracket">{b.name}</span>
                {b.rating == null ? (
                  <span className="wow-spec__muted">No rating</span>
                ) : (
                  <span className="wow-panel__big">{n(b.rating)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="wow-pvp-bgs">
        <h2 id="wow-pvp-bgs" className="wow-h2">
          Battlegrounds
        </h2>
        {view.battlegrounds.length === 0 ? (
          <p className="wow-spec__muted">No battlegrounds played.</p>
        ) : (
          <div className="wow-table-scroll">
            <table className="wow-table">
              <thead>
                <tr>
                  <th scope="col">Battleground</th>
                  <th scope="col">Played</th>
                  <th scope="col">Won</th>
                  <th scope="col">Lost</th>
                  <th scope="col">Win rate</th>
                </tr>
              </thead>
              <tbody>
                {view.battlegrounds.map((bg) => (
                  <tr key={bg.name}>
                    <th scope="row">{bg.name}</th>
                    <td>{n(bg.played)}</td>
                    <td>{n(bg.won)}</td>
                    <td>{n(bg.lost)}</td>
                    <td>{winRate(bg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
