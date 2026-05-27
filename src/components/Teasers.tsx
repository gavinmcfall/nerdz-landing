import Link from "next/link";
import { SectionHead } from "./SectionHead";

// The slim landing's "ways in" — one card per destination. SPA links into the
// app; /manuals and /blog land in plans 3 & 5 (will 404 until then, by choice).
const CARDS = [
  {
    href: "/projects",
    k: "01",
    title: "Projects",
    blurb:
      "SC Bridge, Loot Goblin, Realmstack — self-hostable tools for the hobbies I love.",
  },
  {
    href: "/lab",
    k: "02",
    title: "The Lab",
    blurb:
      "The workbench and the homelab it runs on — live cluster telemetry and all.",
  },
  {
    href: "/manuals",
    k: "03",
    title: "Field Manuals",
    blurb:
      "Printable quick-reference cards for Star Citizen, 3D printing, and adjacent nerdery.",
  },
  {
    href: "/blog",
    k: "04",
    title: "Blog",
    blurb: "Longer-form ramblings from the workshop.",
  },
];

export function Teasers() {
  return (
    <section className="section teasers" id="explore" aria-label="Explore">
      <div className="frame">
        <SectionHead
          num="00"
          title="Where to"
          caption="The workshop, the lab, the manuals, the ramblings."
        />
        <div className="teasers__grid">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="teaser">
              <span className="teaser__k mono">{c.k}</span>
              <h3 className="teaser__title">{c.title}</h3>
              <p className="teaser__blurb">{c.blurb}</p>
              <span className="teaser__arr" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
