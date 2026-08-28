"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReadingGuide } from "@/lib/reading";
import { SyncControl, type SyncStatus } from "./SyncControl";

// Interactive reading-order checklist. localStorage is always the local
// cache (instant paint, offline-safe); when the visitor signs in (Google/
// Discord, opaque-id-only — see /api/auth), progress also syncs to
// Cloudflare KV via /api/reading/progress:
//   · first sign-in on a device UNIONS local+cloud so nothing is lost,
//     then marks the device synced (nerdz.reading.synced.<slug>)
//   · afterwards the cloud copy wins on page load; every toggle pushes
//     (debounced) — last write wins across devices
//   · push failures degrade to "offline" and retry on the next toggle.
// The component binds to localStorage with useSyncExternalStore: the server
// snapshot renders unticked (no hydration mismatch) and 'storage' events
// keep multiple tabs in step.

const STORAGE_VERSION = 1;
const storageKey = (slug: string) => `nerdz.reading.${slug}`;
const syncedFlagKey = (slug: string) => `nerdz.reading.synced.${slug}`;
const PUSH_DEBOUNCE_MS = 600;

const EMPTY: ReadonlySet<string> = new Set();

function loadChecked(slug: string, validIds: Set<string>): ReadonlySet<string> {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as { v?: number; checked?: unknown };
    if (parsed.v !== STORAGE_VERSION || !Array.isArray(parsed.checked)) {
      return EMPTY;
    }
    return new Set(
      parsed.checked.filter(
        (id): id is string => typeof id === "string" && validIds.has(id),
      ),
    );
  } catch {
    // Malformed JSON or storage denied — start clean rather than crash.
    return EMPTY;
  }
}

function saveChecked(slug: string, checked: ReadonlySet<string>) {
  try {
    window.localStorage.setItem(
      storageKey(slug),
      JSON.stringify({ v: STORAGE_VERSION, checked: [...checked] }),
    );
  } catch {
    // Private browsing / storage denied: ticks just don't survive a reload.
  }
}

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, on: boolean) {
  try {
    if (on) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
  } catch {
    // Storage denied — merge-on-first-sync will just run again next visit.
  }
}

type ProgressStore = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => ReadonlySet<string>;
  getServerSnapshot: () => ReadonlySet<string>;
  set: (next: ReadonlySet<string>) => void;
};

function createProgressStore(
  slug: string,
  validIds: Set<string>,
): ProgressStore {
  let snapshot = loadChecked(slug, validIds);
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  return {
    subscribe(onChange) {
      // Another tab ticking the same guide updates this one live.
      const onStorage = (e: StorageEvent) => {
        if (e.key === storageKey(slug)) {
          snapshot = loadChecked(slug, validIds);
          emit();
        }
      };
      listeners.add(onChange);
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => EMPTY,
    set(next) {
      snapshot = next;
      saveChecked(slug, next);
      emit();
    },
  };
}

export function ReadingGuideChecklist({ guide }: { guide: ReadingGuide }) {
  const validIds = useMemo(
    () => new Set(guide.items.map((i) => i.id)),
    [guide.items],
  );
  const accentByBook = useMemo(
    () => new Map(guide.books.map((b) => [b.key, b.accent])),
    [guide.books],
  );
  const store = useMemo(
    () => createProgressStore(guide.slug, validIds),
    [guide.slug, validIds],
  );
  const checked = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const [sync, setSync] = useState<SyncStatus>({ state: "loading" });
  // Lazily read the ?auth_error marker from the OAuth callback. Initializer
  // runs during render (false on the server; the flag is only shown inside
  // the popover, which is closed at first paint, so hydration can't differ).
  const [authError] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("auth_error"),
  );
  const syncRef = useRef(sync);
  syncRef.current = sync;
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progressUrl = `/api/reading/progress?guide=${encodeURIComponent(guide.slug)}`;

  const pushNow = async (set: ReadonlySet<string>) => {
    const current = syncRef.current;
    if (current.state !== "synced" && current.state !== "offline") return;
    try {
      const res = await fetch(progressUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ v: STORAGE_VERSION, checked: [...set] }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSync({ state: "synced", provider: current.provider });
    } catch {
      setSync({ state: "offline", provider: current.provider });
    }
  };

  const schedulePush = (set: ReadonlySet<string>) => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => void pushNow(set), PUSH_DEBOUNCE_MS);
  };

  useEffect(() => {
    let cancelled = false;

    // Clean the OAuth-callback error marker off the URL (state already read).
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth_error")) {
      params.delete("auth_error");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
    }

    (async () => {
      try {
        const session = (await (
          await fetch("/api/auth/session")
        ).json()) as { signedIn: boolean; provider?: "google" | "discord" };
        if (cancelled) return;
        if (!session.signedIn || !session.provider) {
          setSync({ state: "local" });
          return;
        }
        const provider = session.provider;

        const res = await fetch(progressUrl);
        if (!res.ok) throw new Error(String(res.status));
        const remote = (await res.json()) as { checked?: string[] };
        if (cancelled) return;
        const remoteSet = new Set(
          (remote.checked ?? []).filter((id) => validIds.has(id)),
        );

        if (!readFlag(syncedFlagKey(guide.slug))) {
          // First sync on this device: union local + cloud, push the result.
          const union = new Set([...store.getSnapshot(), ...remoteSet]);
          store.set(union);
          writeFlag(syncedFlagKey(guide.slug), true);
          setSync({ state: "synced", provider });
          const put = await fetch(progressUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ v: STORAGE_VERSION, checked: [...union] }),
          });
          if (!put.ok) setSync({ state: "offline", provider });
        } else {
          // Known-synced device: the cloud copy wins on load.
          store.set(remoteSet);
          setSync({ state: "synced", provider });
        }
      } catch {
        if (!cancelled) setSync({ state: "local" });
      }
    })();

    return () => {
      cancelled = true;
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
    // All stable per guide: store/validIds are useMemo'd on guide, and
    // progressUrl is a value-equal string across renders.
  }, [guide.slug, progressUrl, store, validIds]);

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    store.set(next);
    schedulePush(next);
  };

  const reset = () => {
    if (
      !window.confirm(
        "Clear all ticked chapters for this guide? This can't be undone." +
          (syncRef.current.state === "synced"
            ? " (Clears the synced copy too.)"
            : ""),
      )
    ) {
      return;
    }
    store.set(EMPTY);
    schedulePush(EMPTY);
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Cookie clear failed (offline) — still fall back to local-only UX.
    }
    writeFlag(syncedFlagKey(guide.slug), false);
    setSync({ state: "local" });
  };

  const jump = () => {
    const target =
      guide.items.find((i) => !checked.has(i.id)) ??
      guide.items[guide.items.length - 1];
    document
      .getElementById(`rg-item-${target.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const total = guide.items.length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="rg">
      <div className="rg-bar">
        <div
          className="rg-bar__track"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Reading progress"
        >
          <div className="rg-bar__fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="rg-bar__count mono">
          {done} / {total} · {pct}%
        </span>
        <div className="rg-bar__actions">
          <SyncControl status={sync} authError={authError} onSignOut={signOut} />
          <button className="rg-btn" type="button" onClick={jump}>
            Jump to my place
          </button>
          <a className="rg-btn" href={`/reading/${guide.slug}.pdf`} download>
            Download PDF
          </a>
        </div>
      </div>

      <p className="rg-intro">{guide.intro}</p>

      <div className="rg-legend mono" aria-hidden="true">
        {guide.books.map((b) => (
          <span
            key={b.key}
            className={`rg-legend__item rg-accent--${b.accent}`}
          >
            <span className="rg-legend__dot" /> {b.title}
          </span>
        ))}
      </div>

      <ol className="rg-list">
        {guide.items.map((item) => {
          const isChecked = checked.has(item.id);
          const accent = accentByBook.get(item.book) ?? "gold";
          return (
            <li
              key={item.id}
              id={`rg-item-${item.id}`}
              className={`rg-item rg-accent--${accent}${isChecked ? " rg-item--done" : ""}`}
            >
              <label className="rg-item__label">
                <input
                  type="checkbox"
                  className="rg-item__box"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                />
                <span className="rg-item__text">{item.label}</span>
              </label>
            </li>
          );
        })}
      </ol>

      <div className="rg-foot">
        <button className="rg-btn rg-btn--danger" type="button" onClick={reset}>
          Reset progress
        </button>
      </div>
    </div>
  );
}
