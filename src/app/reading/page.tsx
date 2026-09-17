import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { listGuides } from "@/lib/reading";

// The reading shelf — hub for book reading guides. Later phases will also
// surface live "what I'm reading" data here (Hardcover / Audiobookshelf);
// the guide cards are just the first tenant.
export default async function ReadingPage() {
  const guides = await listGuides();
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
