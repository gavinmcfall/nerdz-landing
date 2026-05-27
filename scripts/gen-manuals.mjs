// Build-time generator: reads the field-manual frontmatter from src/manuals/*.mdx
// and writes it to src/lib/manuals.data.json, which the app imports instead of
// reading the filesystem at request time. The Cloudflare Worker has no fs at
// runtime, so the manuals list must be bundled — this bakes it in at build.
// Run before `next build` / `opennextjs-cloudflare build` (see package.json).
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const MANUALS_DIR = path.join(ROOT, "src", "manuals");
const OUT = path.join(ROOT, "src", "lib", "manuals.data.json");

const files = (await fs.readdir(MANUALS_DIR)).filter((f) => f.endsWith(".mdx"));

const manuals = [];
for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const raw = await fs.readFile(path.join(MANUALS_DIR, file), "utf8");
  const { data } = matter(raw);

  // YAML 1.2 parses bare dates to Date objects — normalise to YYYY-MM-DD so the
  // JSON carries a plain string (matches the zod IsoDateString in manuals.ts).
  if (data.updated instanceof Date) {
    data.updated = data.updated.toISOString().slice(0, 10);
  }
  if (data.slug && data.slug !== slug) {
    throw new Error(
      `gen-manuals: slug mismatch in ${file} — frontmatter "${data.slug}" != filename "${slug}"`,
    );
  }

  manuals.push({ slug, frontmatter: data });
}

manuals.sort((a, b) =>
  String(a.frontmatter.updated) < String(b.frontmatter.updated) ? 1 : -1,
);

await fs.writeFile(OUT, JSON.stringify(manuals, null, 2) + "\n", "utf8");
console.log(
  `gen-manuals: wrote ${manuals.length} manual(s) → ${path.relative(ROOT, OUT)}`,
);
