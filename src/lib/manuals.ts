import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

// ── Frontmatter schema ────────────────────────────────────────
// Every sheet declares: type (component/prose/poster), paper size,
// category, tags, updated date. Posters add the image path + designer.

const PaperSize = z.enum([
  "A4-portrait",
  "A4-landscape",
  "Letter-portrait",
  "Letter-landscape",
  "A3-landscape",
]);

// YAML 1.2 parses bare dates (e.g. `updated: 2026-05-18`) as native Date
// objects rather than strings, so accept either and normalize to YYYY-MM-DD.
const IsoDateString = z
  .union([z.string(), z.date()])
  .transform((v) =>
    typeof v === "string" ? v : v.toISOString().slice(0, 10),
  );

const FrontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "slug must be kebab-case (lowercase, digits, hyphens)"),
    type: z.enum(["component", "prose", "poster"]),
    paperSize: PaperSize,
    // Optional: paper size used when the sheet is paginated for print.
    // Defaults to paperSize. Use when the on-screen layout wants one
    // orientation and the printed sheet wants another (e.g. landscape
    // grid on screen, portrait print).
    printPaperSize: PaperSize.optional(),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    updated: IsoDateString,
    posterAsset: z.string().optional(),
    designer: z.string().optional(),
    summary: z.string().optional(),
  })
  .refine(
    (data) => data.type !== "poster" || !!data.posterAsset,
    { message: "type='poster' requires posterAsset path", path: ["posterAsset"] },
  );

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
export type PaperSize = z.infer<typeof PaperSize>;

export type Manual = {
  slug: string;
  frontmatter: Frontmatter;
};

const MANUALS_DIR = path.join(process.cwd(), "src", "manuals");

// ── Reading sheets from disk ──────────────────────────────────

export async function listManuals(): Promise<Manual[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(MANUALS_DIR);
  } catch {
    return [];
  }

  const mdxFiles = entries.filter((f) => f.endsWith(".mdx"));
  const sheets = await Promise.all(
    mdxFiles.map(async (file) => {
      const slugFromFile = file.replace(/\.mdx$/, "");
      const raw = await fs.readFile(path.join(MANUALS_DIR, file), "utf8");
      const parsed = matter(raw);
      const result = FrontmatterSchema.safeParse(parsed.data);
      if (!result.success) {
        throw new Error(
          `Invalid frontmatter in ${file}: ${result.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")}`,
        );
      }
      if (result.data.slug !== slugFromFile) {
        throw new Error(
          `Slug mismatch in ${file}: frontmatter slug "${result.data.slug}" does not match filename "${slugFromFile}"`,
        );
      }
      return { slug: result.data.slug, frontmatter: result.data };
    }),
  );
  return sheets.sort((a, b) =>
    a.frontmatter.updated < b.frontmatter.updated ? 1 : -1,
  );
}

export async function getManual(slug: string): Promise<Manual | null> {
  const sheets = await listManuals();
  return sheets.find((s) => s.slug === slug) ?? null;
}

export async function listManualSlugs(): Promise<string[]> {
  const sheets = await listManuals();
  return sheets.map((s) => s.slug);
}
