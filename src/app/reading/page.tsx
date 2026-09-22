import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { listUniverses, standaloneGuides } from "@/lib/universes";

// The reading shelf. Big interconnected worlds get universe sections
// (their guides live there); everything else is a standalone guide card.
// Later phases will also surface live "what I'm reading" data here
// (Hardcover / Audiobookshelf).
export default async function ReadingPage() {
  const [universes, guides] = await Promise.all([
    listUniverses(),
    standaloneGuides(),
  ]);
  return (
    <section className="section" id="reading" aria-label="Reading">
      <div className="frame">
        <SectionHead
          title={
            <>
              The Reading <em>shelf</em>
            </>
          }
          caption={<>reading guides · checklists · what i&rsquo;m reading (soon)</>}
        />

        <h3 className="uv-h">Universes</h3>
        <ul className="rg-hub">
          {universes.map((u) => (
            <li key={u.slug}>
              <Link className="rg-hub__card uv-card" href={`/reading/${u.slug}`}>
                <h3 className="rg-hub__title">{u.title}</h3>
                <p className="rg-hub__summary">{u.tagline}</p>
                <span className="rg-hub__meta mono">
                  {u.guides.length} reading paths · {u.works.length} books &amp; extras
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h3 className="uv-h">Series guides</h3>
        <ul className="rg-hub">
          <li>
            <Link className="rg-hub__card" href="/reading/book-club">
              <h3 className="rg-hub__title">The Book Club 📚</h3>
              <p className="rg-hub__summary">
                What Gavin &amp; Kelsie are reading this month — plus the
                mood-match quiz that picks the next one.
              </p>
              <span className="rg-hub__meta mono">
                one book a month · two readers
              </span>
            </Link>
          </li>
          {guides.map((g) => (
            <li key={g.slug}>
              <Link className="rg-hub__card" href={`/reading/${g.slug}`}>
                <h3 className="rg-hub__title">{g.title}</h3>
                <p className="rg-hub__summary">{g.summary}</p>
                <span className="rg-hub__meta mono">
                  {g.items.length} steps · updated {g.updated} · PDF
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
