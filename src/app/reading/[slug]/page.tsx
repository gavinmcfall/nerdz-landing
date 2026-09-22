import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { getGuide, listGuides } from "@/lib/reading";
import { getUniverse, universeForGuide } from "@/lib/universes";
import { ReadingGuideChecklist } from "@/components/reading/ReadingGuide";
import { UniverseHub } from "@/components/reading/UniverseHub";

// Server-rendered per request on the Cloudflare Worker (same OpenNext
// constraint as /manuals/[slug]: data is bundled, and serving a prerendered
// dynamic route would need an incremental-cache backend). One route serves
// both universe sections and guides — their slugs are validated disjoint in
// lib/universes.ts.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const universe = await getUniverse(slug);
  if (universe) {
    return { title: `${universe.title} — nerdz reading`, description: universe.intro };
  }
  const guide = await getGuide(slug);
  if (!guide) return { title: "Not found" };
  return {
    title: `${guide.title} — nerdz reading`,
    description: guide.summary,
  };
}

export default async function ReadingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const universe = await getUniverse(slug);
  if (universe) {
    const guideSlugs = new Set(universe.guides.map((g) => g.slug));
    const guides = (await listGuides()).filter((g) => guideSlugs.has(g.slug));
    const related = (
      await Promise.all(universe.related.map((r) => getUniverse(r)))
    ).filter((u) => u !== null);
    return (
      <section className="section" id="reading-universe" aria-label={universe.title}>
        <div className="frame">
          <p className="rg-crumb mono">
            <Link href="/reading">← the reading shelf</Link>
          </p>
          <SectionHead title={universe.title} caption={<>{universe.tagline}</>} />
          <UniverseHub universe={universe} guides={guides} related={related} />
        </div>
      </section>
    );
  }

  const guide = await getGuide(slug);
  if (!guide) notFound();
  const home = await universeForGuide(slug);

  return (
    <section className="section" id="reading-guide" aria-label={guide.title}>
      <div className="frame">
        <p className="rg-crumb mono">
          {home ? (
            <Link href={`/reading/${home.slug}`}>← {home.title}</Link>
          ) : (
            <Link href="/reading">← the reading shelf</Link>
          )}
        </p>
        <SectionHead
          title={guide.title}
          caption={
            <>
              {guide.items.length} steps · updated {guide.updated}
            </>
          }
        />
        <ReadingGuideChecklist guide={guide} />
      </div>
    </section>
  );
}
