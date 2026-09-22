import Link from "next/link";
import type { ReadingGuide } from "@/lib/reading";
import type { Universe, UniverseWork } from "@/lib/universes";

// A universe section of the reading shelf: reading paths, timeline and
// crossovers, every book/bonus piece with where to find it, a gallery of
// maps and art, and sources. Server component — all content is bundled.

const ROLE_LABEL = {
  main: "reading path",
  tandem: "tandem read",
  combined: "combined order",
} as const;

const KIND_ORDER: UniverseWork["kind"][] = [
  "series",
  "novella",
  "companion",
  "bonus",
  "upcoming",
];
const KIND_LABEL: Record<UniverseWork["kind"], string> = {
  series: "The series",
  novella: "Novellas",
  companion: "Companions",
  bonus: "Bonus chapters & stories",
  upcoming: "Coming soon",
};
const AVAILABILITY_LABEL: Record<UniverseWork["availability"], string> = {
  standard: "in every edition",
  free: "free",
  paid: "sold separately",
  "edition-exclusive": "special edition only",
  "out-of-print": "out of print",
  upcoming: "not out yet",
};

export function UniverseHub({
  universe,
  guides,
  related,
}: {
  universe: Universe;
  guides: ReadingGuide[];
  related: Universe[];
}) {
  const bySlug = new Map(guides.map((g) => [g.slug, g]));
  const worksByKind = KIND_ORDER.map((kind) => ({
    kind,
    works: universe.works.filter((w) => w.kind === kind),
  })).filter((group) => group.works.length > 0);

  return (
    <div className="uv">
      <p className="uv-intro">{universe.intro}</p>

      <nav className="uv-toc mono" aria-label="On this page">
        <a href="#paths">reading paths</a>
        {universe.timeline.length > 0 && <a href="#timeline">timeline</a>}
        {universe.works.length > 0 && <a href="#works">books & bonus</a>}
        {universe.gallery.length > 0 && <a href="#gallery">maps & art</a>}
        {universe.sources.length > 0 && <a href="#sources">sources</a>}
      </nav>

      <section id="paths" className="uv-block">
        <h3 className="uv-h">Reading paths</h3>
        <ul className="rg-hub">
          {universe.guides.map((ref) => {
            const g = bySlug.get(ref.slug)!;
            return (
              <li key={ref.slug}>
                <Link className="rg-hub__card" href={`/reading/${g.slug}`}>
                  <span className="uv-role mono">{ROLE_LABEL[ref.role]}</span>
                  <h4 className="rg-hub__title">{g.title}</h4>
                  <p className="rg-hub__summary">{ref.blurb ?? g.summary}</p>
                  <span className="rg-hub__meta mono">
                    {g.items.length} steps · PDF
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {(universe.timeline.length > 0 || universe.crossovers.length > 0) && (
        <section id="timeline" className="uv-block uv-split">
          {universe.timeline.length > 0 && (
            <div>
              <h3 className="uv-h">Timeline</h3>
              <ol className="uv-timeline">
                {universe.timeline.map((t) => (
                  <li key={t.label}>
                    <span className="uv-timeline__label mono">{t.label}</span>
                    <span>{t.detail}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {universe.crossovers.length > 0 && (
            <div>
              <h3 className="uv-h">Crossovers</h3>
              <ul className="uv-cross">
                {universe.crossovers.map((c) => (
                  <li key={c.title}>
                    <strong>{c.title}</strong>
                    <span>{c.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {worksByKind.length > 0 && (
        <section id="works" className="uv-block">
          <h3 className="uv-h">Every book & bonus piece</h3>
          {worksByKind.map((group) => (
            <div key={group.kind} className="uv-works">
              <h4 className="uv-works__kind mono">{KIND_LABEL[group.kind]}</h4>
              <ul>
                {group.works.map((w) => (
                  <li key={w.title} className="uv-work">
                    <div className="uv-work__head">
                      <span className="uv-work__title">{w.title}</span>
                      <span className={`uv-badge uv-badge--${w.availability}`}>
                        {AVAILABILITY_LABEL[w.availability]}
                      </span>
                    </div>
                    <p className="uv-work__detail">{w.detail}</p>
                    {w.warning && <p className="uv-work__warn">⚠ {w.warning}</p>}
                    {(w.where || w.placement) && (
                      <p className="uv-work__meta mono">
                        {w.where && <span>where: {w.where}</span>}
                        {w.placement && <span>read: {w.placement}</span>}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {universe.gallery.length > 0 && (
        <section id="gallery" className="uv-block">
          <h3 className="uv-h">Maps & art</h3>
          <ul className="uv-gallery">
            {universe.gallery.map((item) => (
              <li key={item.title} className="uv-gallery__item">
                {item.kind === "image" ? (
                  <figure>
                    <a href={item.src} target="_blank" rel="noreferrer noopener">
                      <img src={item.src} alt={item.title} loading="lazy" />
                    </a>
                    <figcaption>
                      <strong>{item.title}</strong>
                      {item.caption && <span>{item.caption}</span>}
                      {item.credit && <span className="mono">© {item.credit}</span>}
                    </figcaption>
                  </figure>
                ) : (
                  <a
                    className="uv-gallery__link"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span className="uv-gallery__icon" aria-hidden="true">
                      🗺️
                    </span>
                    <strong>{item.title} ↗</strong>
                    {item.caption && <span>{item.caption}</span>}
                    {item.credit && <span className="mono">via {item.credit}</span>}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="uv-block">
          <h3 className="uv-h">Connected worlds</h3>
          <p className="uv-related">
            {related.map((r, i) => (
              <span key={r.slug}>
                {i > 0 && " · "}
                <Link href={`/reading/${r.slug}`}>{r.title}</Link>
              </span>
            ))}
          </p>
        </section>
      )}

      {universe.sources.length > 0 && (
        <section id="sources" className="uv-block">
          <h3 className="uv-h">Sources</h3>
          <ul className="uv-sources">
            {universe.sources.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer noopener">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
