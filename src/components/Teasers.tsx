import Link from "next/link";
import { SectionHead } from "./SectionHead";
import { blogLink } from "@/lib/flags";

type Card = {
  href: string;
  k: string;
  title: string;
  blurb: string;
  external?: boolean;
};

// The slim landing's "ways in" — one card per destination. SPA links into the
// app; "blog" is feature-flagged (lib/flags.ts) — the live subdomain until the
// same-origin /blog edge route ships (plan 5).
const CARDS: Card[] = [
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
    href: blogLink.href,
    external: blogLink.external,
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
          title="Where to"
          caption="The workshop, the lab, the manuals, the ramblings."
        />
        <div className="teasers__grid">
          {CARDS.map((c) => {
            const inner = (
              <>
                <span className="teaser__k mono">{c.k}</span>
                <h3 className="teaser__title">{c.title}</h3>
                <p className="teaser__blurb">{c.blurb}</p>
                <span className="teaser__arr" aria-hidden="true">
                  →
                </span>
              </>
            );
            return c.external ? (
              <a
                key={c.href}
                href={c.href}
                className="teaser"
                target="_blank"
                rel="noreferrer noopener"
              >
                {inner}
              </a>
            ) : (
              <Link key={c.href} href={c.href} className="teaser">
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
