import { listManuals } from "@/lib/manuals";
import { HubCockpit } from "@/components/hub/HubCockpit";

export default async function Home() {
  const manuals = (await listManuals()).map((m) => ({
    slug: m.slug,
    title: m.frontmatter.title,
    summary: m.frontmatter.summary ?? "",
    type: m.frontmatter.type,
    paper: m.frontmatter.printPaperSize ?? m.frontmatter.paperSize,
    category: m.frontmatter.category,
    updated: m.frontmatter.updated,
  }));
  return <HubCockpit manuals={manuals} />;
}
