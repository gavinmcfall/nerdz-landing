import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getManual } from "@/lib/manuals";
import { ManualLayout } from "@/components/ManualLayout";

// Server-rendered per request on the Cloudflare Worker. The manuals list +
// frontmatter are bundled (lib/manuals.ts → manuals.data.json) and the MDX
// bodies are bundled too, so SSR needs no filesystem and no incremental-cache
// backend — which OpenNext would otherwise require to serve a *prerendered*
// dynamic route (and without it, 404s). Unknown slugs 404 via getManual.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sheet = await getManual(slug);
  if (!sheet) return { title: "Not found" };
  return {
    title: `${sheet.frontmatter.title} — nerdz field manuals`,
    description: sheet.frontmatter.summary,
  };
}

export default async function SheetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sheet = await getManual(slug);
  if (!sheet) notFound();

  // Dynamically import the MDX module by slug. Body content is rendered as
  // <SheetBody /> (the default export from the .mdx file). Posters render
  // the image inline via ManualLayout and skip the MDX body.
  if (sheet.frontmatter.type === "poster") {
    return <ManualLayout manual={sheet} />;
  }

  const mod = await import(`@/manuals/${sheet.slug}.mdx`);
  const SheetBody = mod.default;
  return (
    <ManualLayout manual={sheet}>
      <SheetBody />
    </ManualLayout>
  );
}
