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
