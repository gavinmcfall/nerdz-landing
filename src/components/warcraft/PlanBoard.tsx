"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { classSlug } from "@/lib/warcraft/format";
import {
  DUAL_SPEC_LEVEL,
  MAX_LEVEL,
  PRIMARY,
  SECONDARY,
  SPECIALIZATIONS,
  SPECS,
  coverage,
  levelFor,
  moveInQueue,
  roleGroups,
  type Plan,
  type PlanCharacter,
  type PlanProf,
} from "@/lib/warcraft/plan";

type Synced = { game: string; name: string; status: string; level?: number; lastSuccessAt?: string };
type SaveState = "idle" | "saving" | "saved" | "conflict" | "error";

const LOGIN_HREF = "/api/auth/login/google?from=/lab/warcraft/plan";
const SAVE_DELAY_MS = 700;

// Everyone sees the plan; the editor (signed in and on the editor list)
// gets the controls. Edits save on their own shortly after each change.
export function PlanBoard({ initialPlan, synced }: { initialPlan: Plan; synced: Synced[] }) {
  const [plan, setPlan] = useState(initialPlan);
  const [access, setAccess] = useState({ signedIn: false, editor: false });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [conflict, setConflict] = useState<Plan | null>(null);

  // The updatedAt of the stored plan our edits build on, and the latest
  // unsaved plan. Refs, so the save loop always sees current values.
  const base = useRef(initialPlan.updatedAt);
  const pending = useRef<Plan | null>(null);
  const saving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conflictRef = useRef<Plan | null>(null);
  useEffect(() => {
    conflictRef.current = conflict;
  }, [conflict]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/warcraft/plan", { cache: "no-store" });
        const data = (await res.json()) as { plan: Plan; signedIn: boolean; editor: boolean };
        if (cancelled) return;
        setAccess({ signedIn: data.signedIn, editor: data.editor });
        if (data.editor) {
          base.current = data.plan.updatedAt;
          setPlan(data.plan);
        }
      } catch {
        // Stay read-only.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Saves the latest unsaved plan, then any edit made while that save was
  // in flight. Stops on a failure; the next edit tries again.
  const flush = useCallback(async () => {
    if (saving.current) return;
    saving.current = true;
    while (pending.current && !conflictRef.current) {
      const next = pending.current;
      pending.current = null;
      setSaveState("saving");
      try {
        const res = await fetch("/api/warcraft/plan", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base: base.current, plan: next }),
        });
        const data = (await res.json()) as { plan?: Plan; error?: string };
        if (res.ok && data.plan) {
          base.current = data.plan.updatedAt;
          if (!pending.current) setSaveState("saved");
          continue;
        }
        if (res.status === 409 && data.plan) {
          conflictRef.current = data.plan;
          setConflict(data.plan);
          setSaveState("conflict");
          break;
        }
      } catch {
        // Falls through to the error state.
      }
      pending.current = pending.current ?? next;
      setSaveState("error");
      break;
    }
    saving.current = false;
  }, []);

  const edit = useCallback(
    (change: (p: Plan) => Plan) => {
      if (conflictRef.current) return;
      setPlan((current) => {
        const next = change(current);
        pending.current = next;
        return next;
      });
      setSaveState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    },
    [flush],
  );

  const editCharacter = (id: string, change: (c: PlanCharacter) => PlanCharacter) =>
    edit((p) => ({ ...p, characters: p.characters.map((c) => (c.id === id ? change(c) : c)) }));

  const takeStored = () => {
    if (!conflict) return;
    base.current = conflict.updatedAt;
    setPlan(conflict);
    setConflict(null);
    setSaveState("idle");
  };

  const editor = access.editor;
  const byId = new Map(plan.characters.map((c) => [c.id, c]));

  return (
    <div className="wow-plan">
      <div className="wow-plan__bar mono">
        {editor ? (
          <span className={`wow-plan__save wow-plan__save--${saveState}`} role="status">
            {saveState === "saving" && "saving…"}
            {saveState === "saved" && "saved"}
            {saveState === "error" && "not saved — will retry on the next change"}
            {saveState === "conflict" && (
              <>
                changed in another tab ·{" "}
                <button type="button" onClick={takeStored}>
                  load the newer plan
                </button>
              </>
            )}
            {saveState === "idle" && "editing"}
          </span>
        ) : access.signedIn ? (
          <span>view only</span>
        ) : (
          <a href={LOGIN_HREF}>sign in to edit</a>
        )}
      </div>

      <h3 className="wow-plan__head">Up next</h3>
      <Queue plan={plan} byId={byId} synced={synced} editor={editor} onMove={(id, to) => edit((p) => ({ ...p, queue: moveInQueue(p.queue, id, to) }))} />

      <h3 className="wow-plan__head">Coverage</h3>
      <Coverage plan={plan} />

      <h3 className="wow-plan__head">Characters</h3>
      <div className="wow-plan__cards">
        {plan.queue.map((id) => {
          const c = byId.get(id)!;
          return <CharacterCard key={id} c={c} synced={synced} editor={editor} onChange={(change) => editCharacter(id, change)} />;
        })}
      </div>
    </div>
  );
}

function profLabel(pr: PlanProf) {
  return pr.s ? `${pr.p} (${pr.s})` : pr.p;
}

function Queue({
  plan,
  byId,
  synced,
  editor,
  onMove,
}: {
  plan: Plan;
  byId: Map<string, PlanCharacter>;
  synced: Synced[];
  editor: boolean;
  onMove: (id: string, to: number) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  return (
    <ol className="wow-plan__queue">
      {plan.queue.map((id, i) => {
        const c = byId.get(id)!;
        const { level } = levelFor(c, synced);
        const profs = c.profs.filter((pr) => pr.p).map(profLabel).join(" + ") || "no professions yet";
        const toDual = DUAL_SPEC_LEVEL - level;
        return (
          <li
            key={id}
            className={`wow-plan__row${dragId === id ? " is-dragging" : ""}${overId === id && dragId !== id ? " is-over" : ""}`}
            data-class={classSlug(c.cls)}
            draggable={editor}
            onDragStart={(e) => {
              setDragId(id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            onDragOver={(e) => {
              if (!dragId) return;
              e.preventDefault();
              setOverId(id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) onMove(dragId, i);
              setDragId(null);
              setOverId(null);
            }}
          >
            <span className="wow-plan__pos mono">{i + 1}</span>
            <div className="wow-plan__who">
              <span className="wow-plan__name">{c.name}</span>
              <span className="wow-plan__cls">{c.cls}</span>
              {i === 0 && <span className="wow-plan__now mono">playing now</span>}
              <span className="wow-plan__meta">
                Level {level} · {c.spec} → {c.dual}
                {toDual > 0 && <span className="wow-plan__hint"> ({toDual} levels to dual spec)</span>} · {profs}
              </span>
            </div>
            {editor && (
              <div className="wow-plan__move">
                <button type="button" aria-label={`Move ${c.name} up`} disabled={i === 0} onClick={() => onMove(id, i - 1)}>
                  ↑
                </button>
                <button type="button" aria-label={`Move ${c.name} down`} disabled={i === plan.queue.length - 1} onClick={() => onMove(id, i + 1)}>
                  ↓
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Coverage({ plan }: { plan: Plan }) {
  const rows = coverage(plan);
  const roles = roleGroups(plan);
  return (
    <>
      <div className="wow-plan__scroll">
        <table className="wow-plan__cov">
          <thead>
            <tr>
              <th>Profession</th>
              <th>Who</th>
              <th>Materials</th>
              <th>Specializations</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.profession}>
                <td>
                  <strong>{r.profession}</strong>{" "}
                  {r.holders.length === 0 ? <span className="wow-plan__bad">gap</span> : r.holders.length > 1 && <span className="wow-plan__ok">×{r.holders.length}</span>}
                </td>
                <td>
                  {r.holders.length === 0 && <span className="wow-plan__bad">Nobody</span>}
                  {r.holders.map((h) => (
                    <span key={h.id} className="wow-plan__chip" data-class={classSlug(h.cls)}>
                      <span className="wow-plan__dot" />
                      {h.name}
                      {h.specialization && <small> {h.specialization}</small>}
                    </span>
                  ))}
                </td>
                <td>
                  {"feeds" in r.supply && `Feeds ${r.supply.feeds.join(", ")}`}
                  {"note" in r.supply && r.supply.note}
                  {"gatherer" in r.supply &&
                    (r.supply.covered ? (
                      <>
                        <span className="wow-plan__ok">{r.supply.gatherer} ✓</span>
                        {r.supply.selfSupplied && " each gathers their own"}
                      </>
                    ) : (
                      <span className="wow-plan__bad">Nobody has {r.supply.gatherer}</span>
                    ))}
                </td>
                <td>
                  {r.specializations.map((s, i) => (
                    <span key={s.name}>
                      {i > 0 && " · "}
                      <span className={s.taken ? "wow-plan__ok" : "wow-plan__warn"}>
                        {s.name} {s.taken ? "✓" : "—"}
                      </span>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="wow-plan__roles">
        {(Object.keys(roles) as (keyof typeof roles)[]).map((role) => (
          <div key={role} className="wow-plan__role">
            <h4>
              {role} <span className="mono">{roles[role].length}</span>
            </h4>
            {roles[role].length === 0 && <span className="wow-plan__bad">None</span>}
            {roles[role].map((e) => (
              <span key={`${e.id}-${e.dual}`} className="wow-plan__chip" data-class={classSlug(e.cls)}>
                <span className="wow-plan__dot" />
                {e.name}{" "}
                <small>
                  {e.spec}
                  {e.dual && ` @${DUAL_SPEC_LEVEL}`}
                </small>
              </span>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function CharacterCard({
  c,
  synced,
  editor,
  onChange,
}: {
  c: PlanCharacter;
  synced: Synced[];
  editor: boolean;
  onChange: (change: (c: PlanCharacter) => PlanCharacter) => void;
}) {
  const specs: readonly string[] = SPECS[c.cls];
  const { level, synced: levelSynced } = levelFor(c, synced);

  const setProf = (i: 0 | 1, prof: PlanProf) =>
    onChange((x) => {
      const profs = [...x.profs] as PlanCharacter["profs"];
      profs[i] = prof;
      return { ...x, profs };
    });

  return (
    <article className="wow-plan__card" data-class={classSlug(c.cls)}>
      <header className="wow-plan__card-top">
        <div>
          <span className="wow-plan__card-name">{c.name}</span> <span className="wow-plan__cls">{c.cls}</span>
          <div className="wow-plan__race">{c.race}</div>
        </div>
        <div className="wow-plan__level mono">
          {editor && !levelSynced ? (
            <label>
              level{" "}
              <input
                type="number"
                min={1}
                max={MAX_LEVEL}
                value={c.level}
                onChange={(e) => {
                  const n = Math.max(1, Math.min(MAX_LEVEL, Math.round(Number(e.target.value)) || 1));
                  onChange((x) => ({ ...x, level: n }));
                }}
              />
            </label>
          ) : (
            <span title={levelSynced ? "From the Armoury's nightly sync" : undefined}>
              level {level}
              {levelSynced && " · synced"}
            </span>
          )}
        </div>
      </header>

      <div className="wow-plan__fields">
        <span className="wow-plan__label">Spec</span>
        <div>
          {editor ? (
            <select value={c.spec} aria-label={`${c.name} spec`} onChange={(e) => onChange((x) => ({ ...x, spec: e.target.value }))}>
              {specs.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          ) : (
            c.spec
          )}
        </div>
        <span className="wow-plan__label">Dual @{DUAL_SPEC_LEVEL}</span>
        <div>
          {editor ? (
            <select value={c.dual} aria-label={`${c.name} dual spec`} onChange={(e) => onChange((x) => ({ ...x, dual: e.target.value }))}>
              {specs.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          ) : (
            c.dual
          )}
        </div>
        {([0, 1] as const).map((i) => {
          const pr = c.profs[i];
          const other = c.profs[i === 0 ? 1 : 0].p;
          const options = SPECIALIZATIONS[pr.p];
          return (
            <div key={i} className="wow-plan__field-row">
              <span className="wow-plan__label">Profession {i + 1}</span>
              <div>
                {editor ? (
                  <span className="wow-plan__pair">
                    <select value={pr.p} aria-label={`${c.name} profession ${i + 1}`} onChange={(e) => setProf(i, { p: e.target.value as PlanProf["p"], s: "" })}>
                      <option value="">None</option>
                      {PRIMARY.filter((p) => p !== other).map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    {options && (
                      <select value={pr.s} aria-label={`${c.name} ${pr.p} specialization`} onChange={(e) => setProf(i, { p: pr.p, s: e.target.value })}>
                        <option value="">No specialization</option>
                        {options.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </span>
                ) : (
                  profLabel(pr) || "—"
                )}
              </div>
            </div>
          );
        })}
        <span className="wow-plan__label">Secondary</span>
        <div>
          {editor ? (
            <span className="wow-plan__checks">
              {SECONDARY.map((s) => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={c.secondary.includes(s)}
                    onChange={(e) =>
                      onChange((x) => ({
                        ...x,
                        secondary: SECONDARY.filter((y) => (y === s ? e.target.checked : x.secondary.includes(y))),
                      }))
                    }
                  />
                  {s}
                </label>
              ))}
            </span>
          ) : (
            c.secondary.join(", ") || "—"
          )}
        </div>
      </div>

      {editor ? (
        <textarea
          className="wow-plan__notes"
          aria-label={`${c.name} plan`}
          placeholder="Goals, recipes to chase, reminders"
          maxLength={2000}
          value={c.notes}
          onChange={(e) => onChange((x) => ({ ...x, notes: e.target.value }))}
        />
      ) : (
        c.notes && <p className="wow-plan__notes-text">{c.notes}</p>
      )}
    </article>
  );
}
