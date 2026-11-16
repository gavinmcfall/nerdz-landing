"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { CollectionsView } from "@/lib/warcraft/types";
import { collectionCount, filterAchievements, mountRender } from "@/lib/warcraft/format";
import { COLLECTIONS, COLLECTION_LABELS, collectionHref, type Collection } from "@/lib/warcraft/resolve";

type Entry = CollectionsView[Collection][number];

export function CollectionsTab({
  view,
  route,
  collection,
}: {
  view: CollectionsView | null;
  route: string[];
  collection: Collection;
}) {
  const [query, setQuery] = useState("");
  const inputId = useId();

  if (!view) {
    return (
      <div className="wow-soon">
        <p>No collection data yet. It appears after the next nightly sync.</p>
      </div>
    );
  }

  const items: Entry[] = view[collection];
  const shown = filterAchievements(items, query);

  return (
    <section className="wow-col" aria-label="Collections">
      <nav className="wow-col__nav" aria-label="Collections">
        {COLLECTIONS.map((c) => (
          <Link
            key={c}
            href={collectionHref(route, c)}
            className="wow-col__link"
            aria-current={c === collection ? "page" : undefined}
            scroll={false}
          >
            {COLLECTION_LABELS[c]} <span className="wow-col__n">{view[c].length.toLocaleString("en-US")}</span>
          </Link>
        ))}
      </nav>

      <div className="wow-ach__head">
        <h2 className="wow-h2">{collectionCount(collection, items.length)}</h2>
        {items.length > 0 && (
          <div className="wow-rep__filter">
            <label htmlFor={inputId} className="wow-rep__label">
              Filter
            </label>
            <input
              id={inputId}
              type="search"
              className="wow-rep__input"
              placeholder={`Search ${COLLECTION_LABELS[collection].toLowerCase()}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {items.length > 0 && shown.length === 0 && (
        <p className="wow-spec__muted">Nothing matches &ldquo;{query.trim()}&rdquo;.</p>
      )}
      {/* Mounts get larger tiles with a picture of the model. */}
      <ul className={`wow-col__grid${collection === "mounts" ? " wow-col__grid--renders" : ""}`}>
        {shown.map((item) => (
          <Tile key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

// The detail under a name: how many of a pet species and its level, or an
// heirloom's upgrade level.
function detail(item: Entry): string | null {
  if ("owned" in item) return [item.owned > 1 ? `×${item.owned}` : null, `Level ${item.level}`].filter(Boolean).join(" · ");
  if ("upgrade" in item) return item.upgrade > 0 ? `Upgrade ${item.upgrade}` : null;
  return null;
}

function Tile({ item }: { item: Entry }) {
  const note = detail(item);
  return (
    <li className="wow-col__tile">
      <span className="wow-col__icon" aria-hidden="true">
        {item.icon && (mountRender(item.icon) ? <MountPicture icon={item.icon} /> : <img src={item.icon} alt="" width={56} height={56} loading="lazy" />)}
      </span>
      <span className="wow-ach__text">
        <span className="wow-col__name">{item.name}</span>
        {note && <span className="wow-rep__detail">{note}</span>}
      </span>
    </li>
  );
}

// Wowhead's framed thumbnail of the mount, or Blizzard's render (the mount
// small on black, so it is shown enlarged) if Wowhead has none. An image
// can fail before React hydrates and attaches onError, so the ref checks
// for that too.
function MountPicture({ icon }: { icon: string }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? icon : (mountRender(icon) as string);
  return (
    <img
      key={src}
      src={src}
      alt=""
      width={300}
      height={300}
      loading="lazy"
      className={failed ? "wow-col__render wow-col__render--blizzard" : "wow-col__render"}
      onError={failed ? undefined : () => setFailed(true)}
      ref={(img) => {
        if (!failed && img?.complete && img.naturalWidth === 0) setFailed(true);
      }}
    />
  );
}
