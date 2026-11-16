"use client";

import { useId, useState } from "react";
import type { Faction, ReputationView } from "@/lib/warcraft/types";
import { filterReputation, reputationProgress } from "@/lib/warcraft/format";

export function ReputationTab({ view }: { view: ReputationView | null }) {
  const [query, setQuery] = useState("");
  const inputId = useId();

  if (!view || view.groups.length === 0) {
    return (
      <div className="wow-soon">
        <p>{view ? "No reputations yet." : "No reputation data yet. It appears after the next nightly sync."}</p>
      </div>
    );
  }

  const groups = filterReputation(view.groups, query);
  return (
    <section className="wow-rep" aria-label="Reputation">
      <div className="wow-rep__filter">
        <label htmlFor={inputId} className="wow-rep__label">
          Filter
        </label>
        <input
          id={inputId}
          type="search"
          className="wow-rep__input"
          placeholder="Faction or expansion"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {groups.length === 0 ? (
        <p className="wow-spec__muted">No factions match &ldquo;{query.trim()}&rdquo;.</p>
      ) : (
        groups.map((g) => (
          <section key={g.name} className="wow-rep__group" aria-label={g.name}>
            <h2 className="wow-h2">{g.name}</h2>
            <ul className="wow-rep__list">
              {g.factions.map((f) => (
                <FactionRow key={f.id} faction={f} />
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  );
}

function FactionRow({ faction }: { faction: Faction }) {
  const { percent, detail } = reputationProgress(faction);
  return (
    <li className="wow-rep__row">
      <div className="wow-rep__top">
        <span className="wow-rep__name">{faction.name}</span>
        <span className="wow-rep__standing">{faction.standing}</span>
      </div>
      <div
        className="wow-rep__bar"
        role="progressbar"
        aria-label={`${faction.name}: ${faction.standing}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={detail ?? faction.standing}
      >
        <span className={`wow-rep__fill${faction.paragon ? " wow-rep__fill--paragon" : ""}`} style={{ width: `${percent}%` }} />
      </div>
      {detail && <span className="wow-rep__detail">{detail}</span>}
    </li>
  );
}
