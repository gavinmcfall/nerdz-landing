"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  QUIZ_QUESTIONS,
  RADAR_MAX,
  RADAR_QUESTION_ID,
  SPICE_QUESTION_ID,
  answerIds,
  spiceApplies,
  type Answers,
  type Pick,
} from "@/lib/bookclub";

// The book club page body: current pick + archive (public), and — for the
// two club admins — the pick editor, invite minting, the mood-match quiz,
// and the match-up view. All state lives server-side in KV via
// /api/bookclub/*; this component is a thin, optimistic client over it.

type ClubData = {
  current: Pick | null;
  archive: Pick[];
  memberNames: string[];
  isAdmin: boolean;
  me?: { name: string };
  quizzes?: { name: string; mine: boolean; answers: Answers; updatedAt: string }[];
};

type PickForm = {
  url: string;
  month: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
};

const EMPTY_FORM: PickForm = {
  url: "",
  month: new Date().toISOString().slice(0, 7),
  title: "",
  author: "",
  coverUrl: "",
  description: "",
};

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-NZ", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const chilis = (level: string) => "🌶️".repeat(Math.max(1, Math.min(5, Number(level) || 1)));

export function BookClub() {
  const [data, setData] = useState<ClubData | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [status, setStatus] = useState("");

  const reload = async () => {
    try {
      const res = await fetch("/api/bookclub");
      if (res.ok) setData((await res.json()) as ClubData);
    } catch {
      // network hiccup — page stays on whatever it has
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = (await (await fetch("/api/auth/session")).json()) as {
          signedIn: boolean;
        };
        if (!cancelled) setSignedIn(session.signedIn);
      } catch {
        // treat as signed out
      }
      if (!cancelled) await reload();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return <p className="bc-loading mono">loading the shelf…</p>;

  return (
    <div className="bc">
      {data.memberNames.length > 0 && (
        <p className="bc-readers mono">
          the readers · {data.memberNames.join(" & ")}
        </p>
      )}
      <CurrentPick pick={data.current} />
      {data.isAdmin && (
        <AdminPanel currentMonth={data.current?.month} onSaved={reload} setStatus={setStatus} />
      )}
      {data.isAdmin && <InvitePanel memberNames={data.memberNames} />}
      <InviteRedeemer signedIn={signedIn} isAdmin={data.isAdmin} onJoined={reload} />
      {data.isAdmin && (
        <QuizSection
          myName={data.me?.name ?? ""}
          quizzes={data.quizzes ?? []}
          onSaved={reload}
        />
      )}
      {status && <p className="bc-status mono">{status}</p>}
      <Archive picks={data.archive} />
    </div>
  );
}

// ── Current pick ──────────────────────────────────────────────────────

function CurrentPick({ pick }: { pick: Pick | null }) {
  if (!pick) {
    return (
      <div className="bc-hero bc-hero--empty">
        <p>No book on the table yet — the next pick lands here.</p>
      </div>
    );
  }
  return (
    <div className="bc-hero">
      {pick.coverUrl ? (
        // Remote covers come from the book sites' CDNs; plain img keeps us
        // off next/image's remote-domain allowlist.
        <img className="bc-hero__cover" src={pick.coverUrl} alt="" width={190} height={280} />
      ) : (
        <div className="bc-hero__cover bc-hero__cover--blank" aria-hidden="true">
          📖
        </div>
      )}
      <div className="bc-hero__body">
        <span className="bc-hero__month mono">{monthLabel(pick.month)}</span>
        <h3 className="bc-hero__title">{pick.title}</h3>
        {pick.author && <p className="bc-hero__author">by {pick.author}</p>}
        {pick.description && <p className="bc-hero__blurb">{pick.description}</p>}
        <a className="rg-btn" href={pick.url} target="_blank" rel="noreferrer noopener">
          View on {pick.source === "storygraph" ? "StoryGraph" : pick.source === "goodreads" ? "Goodreads" : "Hardcover"} ↗
        </a>
      </div>
    </div>
  );
}

// ── Admin: set the pick ───────────────────────────────────────────────

function AdminPanel({
  currentMonth,
  onSaved,
  setStatus,
}: {
  currentMonth?: string;
  onSaved: () => Promise<void>;
  setStatus: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PickForm>(EMPTY_FORM);
  const [previewed, setPreviewed] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof PickForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const preview = async () => {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/bookclub/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      });
      const meta = (await res.json()) as {
        error?: string;
        fetched?: boolean;
        title?: string;
        author?: string;
        coverUrl?: string;
        description?: string;
      };
      if (!res.ok) {
        setStatus(meta.error ?? "couldn't read that link");
      } else {
        setForm((f) => ({
          ...f,
          title: meta.title || f.title,
          author: meta.author || f.author,
          coverUrl: meta.coverUrl || f.coverUrl,
          description: meta.description || f.description,
        }));
        setStatus(
          meta.fetched
            ? "Fetched — check the fields, tweak anything, then save."
            : "That site wouldn't let us peek — fill the fields in manually and save.",
        );
      }
      setPreviewed(true);
    } catch {
      setStatus("couldn't reach the server — try again");
    }
    setBusy(false);
  };

  const save = async () => {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/bookclub/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("Saved — that's the book. 📚");
        setForm(EMPTY_FORM);
        setPreviewed(false);
        setOpen(false);
        await onSaved();
      } else {
        const err = (await res.json()) as { error?: string };
        setStatus(err.error ?? "save failed");
      }
    } catch {
      setStatus("couldn't reach the server — try again");
    }
    setBusy(false);
  };

  return (
    <div className="bc-admin">
      <button className="rg-btn" type="button" onClick={() => setOpen((v) => !v)}>
        {open ? "Close editor" : currentMonth ? "Set / change a month's book" : "Set the first book"}
      </button>
      {open && (
        <div className="bc-admin__form">
          <label className="bc-field">
            <span>Book link (StoryGraph / Goodreads / Hardcover)</span>
            <input value={form.url} onChange={set("url")} placeholder="https://app.thestorygraph.com/books/…" />
          </label>
          <label className="bc-field">
            <span>Month</span>
            <input type="month" value={form.month} onChange={set("month")} />
          </label>
          <button className="rg-btn" type="button" disabled={busy || !form.url} onClick={preview}>
            {busy ? "…" : "Fetch details"}
          </button>
          {previewed && (
            <>
              <label className="bc-field">
                <span>Title</span>
                <input value={form.title} onChange={set("title")} />
              </label>
              <label className="bc-field">
                <span>Author</span>
                <input value={form.author} onChange={set("author")} />
              </label>
              <label className="bc-field">
                <span>Cover image URL</span>
                <input value={form.coverUrl} onChange={set("coverUrl")} />
              </label>
              <label className="bc-field">
                <span>Blurb</span>
                <textarea rows={3} value={form.description} onChange={set("description")} />
              </label>
              {form.coverUrl && (
                <img className="bc-admin__coverpreview" src={form.coverUrl} alt="cover preview" width={95} height={140} />
              )}
              <button className="rg-btn" type="button" disabled={busy || !form.title} onClick={save}>
                {busy ? "…" : `Save as ${monthLabel(form.month)}'s book`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Admin: invite ─────────────────────────────────────────────────────

function InvitePanel({ memberNames }: { memberNames: string[] }) {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const mint = async () => {
    try {
      const res = await fetch("/api/bookclub/invite", { method: "POST" });
      if (!res.ok) return;
      const { code } = (await res.json()) as { code: string };
      setLink(`${window.location.origin}/reading/book-club?invite=${code}`);
      setCopied(false);
    } catch {
      // leave link empty
    }
  };

  return (
    <div className="bc-invite mono">
      <span>
        club members: {memberNames.length ? memberNames.join(" · ") : "just you so far"}
      </span>
      <button className="rg-btn" type="button" onClick={mint}>
        Invite a co-reader
      </button>
      {link && (
        <span className="bc-invite__link">
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <button
            className="rg-btn"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              } catch {
                // manual copy from the input still works
              }
            }}
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </span>
      )}
    </div>
  );
}

// Handles ?invite=<code> for the invited person: prompts for a name once
// they're signed in, then redeems the code.
function InviteRedeemer({
  signedIn,
  isAdmin,
  onJoined,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  onJoined: () => Promise<void>;
}) {
  const [code] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("invite") ?? ""),
  );
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  if (!code || isAdmin) return null;

  const redeem = async () => {
    try {
      const res = await fetch("/api/bookclub/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name }),
      });
      const body = (await res.json()) as { error?: string };
      if (res.ok) {
        window.history.replaceState(null, "", window.location.pathname);
        await onJoined();
      } else {
        setMessage(body.error ?? "that didn't work");
      }
    } catch {
      setMessage("couldn't reach the server — try again");
    }
  };

  return (
    <div className="bc-redeem">
      <h3>You&rsquo;ve been invited to the book club 🎉</h3>
      {!signedIn ? (
        <p>
          Sign in first (the sync sign-in on any{" "}
          <Link href="/reading">reading page</Link> works — Google or
          Discord), then open your invite link again.
        </p>
      ) : (
        <>
          <label className="bc-field">
            <span>What should we call you?</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kelsie" />
          </label>
          <button className="rg-btn" type="button" disabled={!name.trim()} onClick={redeem}>
            Join the club
          </button>
        </>
      )}
      {message && <p className="bc-status mono">{message}</p>}
    </div>
  );
}

// ── Quiz + match-up ───────────────────────────────────────────────────

function QuizSection({
  myName,
  quizzes,
  onSaved,
}: {
  myName: string;
  quizzes: NonNullable<ClubData["quizzes"]>;
  onSaved: () => Promise<void>;
}) {
  const mine = quizzes.find((q) => q.mine);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(myName);
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);

  const choose = (qid: string, oid: string, multi: boolean) =>
    setAnswers((a) => {
      if (!multi) return { ...a, [qid]: oid };
      const current = answerIds(a[qid]);
      const next = current.includes(oid)
        ? current.filter((id) => id !== oid)
        : [...current, oid];
      return { ...a, [qid]: next };
    });

  // Answers are seeded from the latest saved copy when the editor opens
  // (see startEditing) — no effect-driven sync needed.
  const startEditing = () => {
    setAnswers(mine?.answers ?? {});
    setName(myName || name);
    setEditing(true);
  };

  const showSpice = spiceApplies(answers);
  const visibleQuestions = QUIZ_QUESTIONS.filter(
    (q) => q.id !== SPICE_QUESTION_ID || showSpice,
  );

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/bookclub/quiz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || myName || "Reader", answers }),
      });
      if (res.ok) {
        setEditing(false);
        await onSaved();
      }
    } catch {
      // stay in editing mode; user can retry
    }
    setBusy(false);
  };

  return (
    <div className="bc-quiz">
      <div className="bc-quiz__head">
        <h3>Next-book mood match</h3>
        <button
          className="rg-btn"
          type="button"
          onClick={() => (editing ? setEditing(false) : startEditing())}
        >
          {editing ? "Cancel" : mine ? "Retake quiz" : "Take the quiz"}
        </button>
      </div>

      {editing && (
        <div className="bc-quiz__form">
          <p className="bc-quiz__hint mono">
            tick everything you&rsquo;d be happy with — more ticks, more overlap
          </p>
          <label className="bc-field bc-field--inline">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gavin" />
          </label>
          {visibleQuestions.map((q) => (
            <fieldset className="bc-q" key={q.id}>
              <legend>{q.prompt}</legend>
              <div className="bc-q__options">
                {q.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`bc-chip${answerIds(answers[q.id]).includes(o.id) ? " bc-chip--on" : ""}`}
                    onClick={() => choose(q.id, o.id, q.multi === true)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <label className="bc-field">
            <span>Books on your radar (optional)</span>
            <textarea
              rows={2}
              maxLength={RADAR_MAX}
              value={
                typeof answers[RADAR_QUESTION_ID] === "string"
                  ? (answers[RADAR_QUESTION_ID] as string)
                  : ""
              }
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [RADAR_QUESTION_ID]: e.target.value }))
              }
            />
          </label>
          <button className="rg-btn" type="button" disabled={busy} onClick={save}>
            {busy ? "…" : "Save my answers"}
          </button>
        </div>
      )}

      <MatchUp quizzes={quizzes} />
    </div>
  );
}

function MatchUp({ quizzes }: { quizzes: NonNullable<ClubData["quizzes"]> }) {
  const ready = quizzes.length >= 2;
  const rows = useMemo(() => {
    if (!ready) return [];
    return QUIZ_QUESTIONS.map((q) => {
      // Every question is pick-several: a tick means "happy with this", so
      // agreement is set overlap, not exact equality.
      const picks = quizzes.map((z) => ({
        name: z.name,
        ids: answerIds(z.answers[q.id]).filter((id) =>
          q.options.some((o) => o.id === id),
        ),
      }));
      if (picks.every((p) => p.ids.length === 0)) return null;
      const labelOf = (id: string) =>
        q.options.find((o) => o.id === id)!.label;

      if (q.id === SPICE_QUESTION_ID) {
        // Each person's cap = the hottest level they ticked; the club's
        // allowed heat is the lower cap.
        const caps = picks
          .filter((p) => p.ids.length > 0)
          .map((p) => Math.max(...p.ids.map(Number)));
        const allowed = caps.length === picks.length ? Math.min(...caps) : 0;
        return { q, picks, labelOf, shared: [], identical: false, spiceAllowed: allowed };
      }

      const allAnswered = picks.every((p) => p.ids.length > 0);
      const shared = allAnswered
        ? picks[0].ids.filter((id) => picks.every((p) => p.ids.includes(id)))
        : [];
      const identical =
        allAnswered &&
        shared.length > 0 &&
        picks.every((p) => p.ids.length === shared.length);
      return { q, picks, labelOf, shared, identical, spiceAllowed: 0 };
    }).filter((r) => r !== null);
  }, [quizzes, ready]);

  if (!ready) {
    return (
      <p className="bc-quiz__waiting mono">
        {quizzes.length === 1
          ? `${quizzes[0].name} has answered — waiting on the other reader…`
          : "No answers yet — take the quiz above."}
      </p>
    );
  }

  const agreements = rows.filter((r) => r.shared.length > 0);
  const radars = quizzes.filter(
    (z) => typeof z.answers[RADAR_QUESTION_ID] === "string",
  );

  return (
    <div className="bc-match">
      <h4 className="bc-match__title mono">
        the match-up · {quizzes.map((z) => z.name).join(" vs ")}
      </h4>
      {agreements.length > 0 && (
        <p className="bc-match__summary">
          You&rsquo;re both happy with:{" "}
          <strong>
            {agreements
              .flatMap((r) => r.shared.map((id) => r.labelOf(id).toLowerCase()))
              .join(" · ")}
          </strong>
        </p>
      )}
      <ul className="bc-match__rows">
        {rows.map((r) => (
          <li
            key={r.q.id}
            className={`bc-match__row${r.shared.length > 0 || r.spiceAllowed > 0 ? " bc-match__row--agree" : ""}`}
          >
            <span className="bc-match__q">{r.q.prompt}</span>
            {r.q.id === SPICE_QUESTION_ID ? (
              r.spiceAllowed > 0 ? (
                <span className="bc-match__spice">
                  allowed heat: {chilis(String(r.spiceAllowed))}{" "}
                  <span className="mono">(the lower of your two caps)</span>
                </span>
              ) : (
                <SplitPicks picks={r.picks} labelOf={r.labelOf} />
              )
            ) : r.identical ? (
              <span className="bc-match__a">
                {r.shared.map((id) => r.labelOf(id)).join(", ")} ✓
              </span>
            ) : r.shared.length > 0 ? (
              <span className="bc-match__split">
                <span className="bc-match__a">
                  both: {r.shared.map((id) => r.labelOf(id)).join(", ")} ✓
                </span>
                {r.picks.map((p) => {
                  const extras = p.ids.filter((id) => !r.shared.includes(id));
                  return extras.length ? (
                    <span key={p.name}>
                      <em>{p.name} also:</em>{" "}
                      {extras.map((id) => r.labelOf(id)).join(", ")}
                    </span>
                  ) : null;
                })}
              </span>
            ) : (
              <SplitPicks picks={r.picks} labelOf={r.labelOf} />
            )}
          </li>
        ))}
      </ul>
      {radars.length > 0 && (
        <div className="bc-match__radars">
          {radars.map((z) => (
            <p key={z.name}>
              <em>{z.name}&rsquo;s radar:</em> {z.answers[RADAR_QUESTION_ID]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function SplitPicks({
  picks,
  labelOf,
}: {
  picks: { name: string; ids: string[] }[];
  labelOf: (id: string) => string;
}) {
  return (
    <span className="bc-match__split">
      {picks.map((p) => (
        <span key={p.name}>
          <em>{p.name}:</em>{" "}
          {p.ids.length ? p.ids.map(labelOf).join(", ") : "—"}
        </span>
      ))}
    </span>
  );
}

// ── Archive ───────────────────────────────────────────────────────────

function Archive({ picks }: { picks: Pick[] }) {
  if (picks.length === 0) return null;
  return (
    <div className="bc-archive">
      <h3 className="bc-archive__title">Previously, at book club</h3>
      <ul className="bc-archive__shelf">
        {picks.map((p) => (
          <li key={p.id} className="bc-archive__item">
            <a href={p.url} target="_blank" rel="noreferrer noopener">
              {p.coverUrl ? (
                <img src={p.coverUrl} alt="" width={95} height={140} />
              ) : (
                <span className="bc-archive__blank">📖</span>
              )}
              <span className="bc-archive__month mono">{monthLabel(p.month)}</span>
              <span className="bc-archive__name">{p.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
