import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { getGuide } from "@/lib/reading";
import { ReadingGuideChecklist } from "@/components/reading/ReadingGuide";

// Server-rendered per request on the Cloudflare Worker (same OpenNext
// constraint as /manuals/[slug]: guide data is bundled, and serving a
// prerendered dynamic route would need an incremental-cache backend).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: "Not found" };
  return {
    title: `${guide.title} — nerdz reading`,
    description: guide.summary,
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  return (
    <section className="section" id="reading-guide" aria-label={guide.title}>
      <div className="frame">
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
