import { z } from "zod";
import rawData from "./reading.data.json";

// ── Reading guides (bundled data, no runtime fs) ──────────────
// The Cloudflare Worker has no filesystem at request time, so guides live
// in reading.data.json (authored via scripts/gen-reading-eos-tod.mjs for the
// EOS/ToD guide) and are validated here at module load — same pattern as
// manuals.ts. Item ids are stable and content-derived (eos-17, tod-fireheart),
// never positional: they key saved progress in visitors' localStorage.

const Accent = z.enum(["gold", "glow", "magenta", "ink"]);

const BookSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "book key must be kebab-case"),
  title: z.string().min(1),
  accent: Accent,
});

const ItemSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "item id must be kebab-case"),
  book: z.string().min(1),
  label: z.string().min(1),
  // Short annotation shown under the label (e.g. "novella — read before
  // Defiant"). Used by book-level guides; chapter grids omit it.
  note: z.string().optional(),
});

const GuideSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
    title: z.string().min(1),
    summary: z.string().min(1),
    intro: z.string().min(1),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "updated must be YYYY-MM-DD"),
    books: z.array(BookSchema).min(1),
    items: z.array(ItemSchema).min(1),
  })
  .superRefine((guide, ctx) => {
    const bookKeys = new Set(guide.books.map((b) => b.key));
    const seen = new Set<string>();
    guide.items.forEach((item, i) => {
      if (!bookKeys.has(item.book)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", i, "book"],
          message: `unknown book key "${item.book}"`,
        });
      }
      if (seen.has(item.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", i, "id"],
          message: `duplicate item id "${item.id}"`,
        });
      }
      seen.add(item.id);
    });
  });

export type ReadingGuide = z.infer<typeof GuideSchema>;
export type GuideBook = z.infer<typeof BookSchema>;
export type GuideItem = z.infer<typeof ItemSchema>;
export type BookAccent = z.infer<typeof Accent>;

const GUIDES: ReadingGuide[] = (rawData as unknown[]).map((entry, i) => {
  const result = GuideSchema.safeParse(entry);
  if (!result.success) {
    const slug =
      typeof entry === "object" && entry !== null && "slug" in entry
        ? String((entry as { slug: unknown }).slug)
        : `#${i}`;
    throw new Error(
      `Invalid reading guide "${slug}": ${result.error.issues
        .map((iss) => `${iss.path.join(".")}: ${iss.message}`)
        .join("; ")}`,
    );
  }
  return result.data;
});

export async function listGuides(): Promise<ReadingGuide[]> {
  return GUIDES;
}

export async function getGuide(slug: string): Promise<ReadingGuide | null> {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
