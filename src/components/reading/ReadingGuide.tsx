"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { ReadingGuide } from "@/lib/reading";

// Interactive reading-order checklist. Progress lives in this browser's
// localStorage only (single anonymous reader — no accounts, no sync). The
// stored shape is versioned so a future format change can migrate instead
// of wiping ticks. localStorage is an external store, so the component
// binds to it with useSyncExternalStore: the server snapshot renders
// unticked (no hydration mismatch) and React swaps in the real progress
// after hydration; 'storage' events keep multiple tabs in step.

const STORAGE_VERSION = 1;
const storageKey = (slug: string) => `nerdz.reading.${slug}`;

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
    // Private browsing / storage denied: the page still works, ticks just
    // don't survive a reload.
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

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    store.set(next);
  };

  const reset = () => {
    if (
      !window.confirm(
        "Clear all ticked chapters for this guide? This can't be undone.",
      )
    ) {
      return;
    }
    store.set(EMPTY);
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
