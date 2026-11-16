"use client";

import { useId, useState } from "react";
import type { AchievementCategory, AchievementsView, EarnedAchievement } from "@/lib/warcraft/types";
import { categoryProgress, filterAchievements, formatEarned } from "@/lib/warcraft/format";

// The filter lists at most this many matches; a retail character has
// over a thousand completions.
const MATCH_LIMIT = 100;

type Recent = AchievementsView["recent"][number];

const count = (n: number) => n.toLocaleString("en-US");

export function AchievementsTab({ view }: { view: AchievementsView | null }) {
  const [query, setQuery] = useState("");
  const inputId = useId();

  if (!view) {
    return (
      <div className="wow-soon">
        <p>No achievement data yet. It appears after the next nightly sync.</p>
      </div>
    );
  }

  // Forever achievements carry no points.
  const hasPoints = view.total.points > 0;
  const searching = query.trim() !== "";
  const matches = filterAchievements(view.completed, query);
  const details = new Map(view.recent.map((a) => [a.id, a]));

  return (
    <section className="wow-ach" aria-label="Achievements">
      <dl className="wow-ach__totals">
        {hasPoints && (
          <div>
            <dt>Points</dt>
            <dd className="wow-ach__points">{count(view.total.points)}</dd>
          </div>
        )}
        <div>
          <dt>Earned</dt>
          <dd>{count(view.total.quantity)}</dd>
        </div>
      </dl>

      {view.categories.length > 0 && (
        <section aria-label="Categories">
          <h2 className="wow-h2">Categories</h2>
          <ul className="wow-ach__cats">
            {view.categories.map((c) => (
              <CategoryCard key={c.id} category={c} showPoints={hasPoints} />
            ))}
          </ul>
        </section>
      )}

      <section aria-label={searching ? "Matching achievements" : "Recently earned"}>
        <div className="wow-ach__head">
          <h2 className="wow-h2">{searching ? "Matching achievements" : "Recently earned"}</h2>
          <div className="wow-rep__filter">
            <label htmlFor={inputId} className="wow-rep__label">
              Filter
            </label>
            <input
              id={inputId}
              type="search"
              className="wow-rep__input"
              placeholder={`Search ${count(view.completed.length)} earned`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {searching ? (
          matches.length === 0 ? (
            <p className="wow-spec__muted">No earned achievements match &ldquo;{query.trim()}&rdquo;.</p>
          ) : (
            <>
              <ul className="wow-ach__list">
                {matches.slice(0, MATCH_LIMIT).map((a) => (
                  <AchievementRow key={a.id} achievement={details.get(a.id) ?? a} showPoints={hasPoints} />
                ))}
              </ul>
              {matches.length > MATCH_LIMIT && (
                <p className="wow-spec__muted">
                  Showing {MATCH_LIMIT} of {count(matches.length)}. Narrow the filter to see the rest.
                </p>
              )}
            </>
          )
        ) : view.recent.length === 0 ? (
          <p className="wow-spec__muted">No achievements earned yet.</p>
        ) : (
          <ul className="wow-ach__list">
            {view.recent.map((a) => (
              <AchievementRow key={a.id} achievement={a} showPoints={hasPoints} />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

function CategoryCard({ category: c, showPoints }: { category: AchievementCategory; showPoints: boolean }) {
  const percent = categoryProgress(c.quantity, c.total);
  return (
    <li className="wow-ach__cat">
      <div className="wow-rep__top">
        <span className="wow-rep__name">{c.name}</span>
        <span className="wow-rep__standing">
          {count(c.quantity)}
          {c.total && ` / ${count(c.total.quantity)}`}
        </span>
      </div>
      <div
        className="wow-rep__bar"
        role="progressbar"
        aria-label={c.name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={c.total ? `${count(c.quantity)} of ${count(c.total.quantity)}` : count(c.quantity)}
      >
        <span className="wow-rep__fill" style={{ width: `${percent}%` }} />
      </div>
      {showPoints && <span className="wow-rep__detail">{count(c.points)} points</span>}
    </li>
  );
}

function AchievementRow({ achievement: a, showPoints }: { achievement: EarnedAchievement | Recent; showPoints: boolean }) {
  const extra = "icon" in a ? a : null;
  const meta = [extra?.category, formatEarned(a.completedAt)].filter(Boolean).join(" · ");
  return (
    <li className="wow-ach__row">
      <span className="wow-ach__icon" aria-hidden="true">
        {extra?.icon && <img src={extra.icon} alt="" width={36} height={36} loading="lazy" />}
      </span>
      <span className="wow-ach__text">
        <span className="wow-rep__name">{a.name}</span>
        <span className="wow-rep__detail">{meta}</span>
      </span>
      {showPoints && extra?.points ? (
        <span className="wow-ach__badge" aria-label={`${extra.points} points`}>
          {extra.points}
        </span>
      ) : null}
    </li>
  );
}
