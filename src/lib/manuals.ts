import { z } from "zod";
import rawData from "./manuals.data.json";

// ── Frontmatter schema ────────────────────────────────────────
// Every sheet declares: type (component/prose/poster), paper size,
// category, tags, updated date. Posters add the image path + designer.
//
// The data is read from src/manuals/*.mdx at BUILD time by
// scripts/gen-manuals.mjs (which writes manuals.data.json) — never from the
// filesystem at request time, because the Cloudflare Worker has no fs. The
// schema below still validates the bundled JSON at module load.

const PaperSize = z.enum([
  "A4-portrait",
  "A4-landscape",
  "Letter-portrait",
  "Letter-landscape",
  "A3-landscape",
]);

// gen-manuals normalises dates to YYYY-MM-DD strings; accept either for safety.
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

// ── Bundled manuals (validated at module load, no runtime fs) ──

type RawEntry = { slug: string; frontmatter: unknown };

const MANUALS: Manual[] = (rawData as RawEntry[])
  .map((entry) => {
    const result = FrontmatterSchema.safeParse(entry.frontmatter);
    if (!result.success) {
      throw new Error(
        `Invalid frontmatter for manual "${entry.slug}": ${result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }
    if (result.data.slug !== entry.slug) {
      throw new Error(
        `Slug mismatch for "${entry.slug}": frontmatter slug "${result.data.slug}" does not match`,
      );
    }
    return { slug: result.data.slug, frontmatter: result.data };
  })
  .sort((a, b) => (a.frontmatter.updated < b.frontmatter.updated ? 1 : -1));

export async function listManuals(): Promise<Manual[]> {
  return MANUALS;
}

export async function getManual(slug: string): Promise<Manual | null> {
  return MANUALS.find((m) => m.slug === slug) ?? null;
}

export async function listManualSlugs(): Promise<string[]> {
  return MANUALS.map((m) => m.slug);
}
