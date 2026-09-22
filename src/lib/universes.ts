import { z } from "zod";
import rawData from "./universes.data.json";
import { listGuides, type ReadingGuide } from "./reading";

// ── Reading universes (bundled data, no runtime fs) ───────────
// A universe is a section of the reading shelf for a big interconnected
// world (Solaria, Throne of Glass, ACOTAR, Crescent City): its reading
// paths (guides from reading.data.json), every book and bonus piece with
// where to find it, timeline/crossover notes, and a gallery of maps/art.
// Universe slugs share the /reading/[slug] namespace with guide slugs, so
// they must never collide — checked at module load.

const Kebab = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, "must be kebab-case");

const WorkSchema = z.object({
  title: z.string().min(1),
  kind: z.enum(["series", "novella", "bonus", "companion", "upcoming"]),
  // Short own-words description — never quoted text.
  detail: z.string().min(1),
  availability: z.enum([
    "standard",
    "free",
    "paid",
    "edition-exclusive",
    "out-of-print",
    "upcoming",
  ]),
  where: z.string().optional(),
  placement: z.string().optional(),
  warning: z.string().optional(),
});

const GalleryItemSchema = z
  .object({
    kind: z.enum(["link", "image"]),
    title: z.string().min(1),
    caption: z.string().optional(),
    href: z.string().url().optional(),
    // Site-relative image path under /public (kind "image" only).
    src: z.string().startsWith("/").optional(),
    credit: z.string().optional(),
  })
  .refine((g) => (g.kind === "image" ? !!g.src : !!g.href), {
    message: "image items need src; link items need href",
  });

const UniverseSchema = z.object({
  slug: Kebab,
  title: z.string().min(1),
  tagline: z.string().min(1),
  intro: z.string().min(1),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guides: z
    .array(
      z.object({
        slug: Kebab,
        role: z.enum(["main", "tandem", "combined"]),
        blurb: z.string().optional(),
      }),
    )
    .min(1),
  timeline: z.array(z.object({ label: z.string(), detail: z.string() })).default([]),
  crossovers: z.array(z.object({ title: z.string(), detail: z.string() })).default([]),
  works: z.array(WorkSchema).default([]),
  gallery: z.array(GalleryItemSchema).default([]),
  sources: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
  related: z.array(Kebab).default([]),
});

export type Universe = z.infer<typeof UniverseSchema>;
export type UniverseWork = z.infer<typeof WorkSchema>;
export type GalleryItem = z.infer<typeof GalleryItemSchema>;

const UNIVERSES: Universe[] = (rawData as unknown[]).map((entry, i) => {
  const result = UniverseSchema.safeParse(entry);
  if (!result.success) {
    const slug =
      typeof entry === "object" && entry !== null && "slug" in entry
        ? String((entry as { slug: unknown }).slug)
        : `#${i}`;
    throw new Error(
      `Invalid reading universe "${slug}": ${result.error.issues
        .map((iss) => `${iss.path.join(".")}: ${iss.message}`)
        .join("; ")}`,
    );
  }
  return result.data;
});

// Cross-checks against the guide data: every referenced guide exists, and
// no universe slug shadows a guide slug in the shared /reading/[slug] route.
async function validateAgainstGuides() {
  const guideSlugs = new Set((await listGuides()).map((g) => g.slug));
  for (const u of UNIVERSES) {
    if (guideSlugs.has(u.slug)) {
      throw new Error(`universe slug "${u.slug}" collides with a guide slug`);
    }
    for (const g of u.guides) {
      if (!guideSlugs.has(g.slug)) {
        throw new Error(`universe "${u.slug}" references unknown guide "${g.slug}"`);
      }
    }
    for (const r of u.related) {
      if (!UNIVERSES.some((x) => x.slug === r)) {
        throw new Error(`universe "${u.slug}" relates to unknown universe "${r}"`);
      }
    }
  }
}
const validated = validateAgainstGuides();

export async function listUniverses(): Promise<Universe[]> {
  await validated;
  return UNIVERSES;
}

export async function getUniverse(slug: string): Promise<Universe | null> {
  await validated;
  return UNIVERSES.find((u) => u.slug === slug) ?? null;
}

/** The universe a guide belongs to (first listed), for breadcrumbs. */
export async function universeForGuide(guideSlug: string): Promise<Universe | null> {
  await validated;
  return UNIVERSES.find((u) => u.guides.some((g) => g.slug === guideSlug)) ?? null;
}

/** Guides not claimed by any universe — shown directly on the shelf hub. */
export async function standaloneGuides(): Promise<ReadingGuide[]> {
  await validated;
  const claimed = new Set(UNIVERSES.flatMap((u) => u.guides.map((g) => g.slug)));
  return (await listGuides()).filter((g) => !claimed.has(g.slug));
}
