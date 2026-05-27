import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getManual, listManualSlugs } from "@/lib/manuals";
import { ManualLayout } from "@/components/ManualLayout";

export async function generateStaticParams() {
  const slugs = await listManualSlugs();
  return slugs.map((slug) => ({ slug }));
}

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
