import { NO_STORE, clubContext, requireAdmin } from "@/lib/bookclub-server";
import { pickSource } from "@/lib/bookclub";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({ url: z.string().url().max(1000) });

// Best-effort scrape of a book page's Open Graph metadata. The admin form
// shows every field editable before saving, so imperfect parses are fixed
// by hand and total failure degrades to manual entry — this endpoint never
// needs to be perfect, only helpful.

function metaContent(html: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1].trim());
  }
  return "";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:x27|39);/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

const meta = (prop: string) => [
  new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i",
  ),
  new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
    "i",
  ),
];

export async function POST(req: Request) {
  const ctx = await clubContext(req);
  if (ctx instanceof Response) return ctx;
  const denied = requireAdmin(ctx);
  if (denied) return denied;

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "bad body" }, { status: 400, headers: NO_STORE });
  }
  const { url } = parsed.data;
  const source = pickSource(url);
  if (!source) {
    return Response.json(
      { error: "url must be a StoryGraph, Goodreads or Hardcover book page" },
      { status: 400, headers: NO_STORE },
    );
  }

  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        // Book sites serve full OG tags to ordinary browser UAs.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (res.ok) html = (await res.text()).slice(0, 500_000);
  } catch {
    // fall through — empty fields, admin fills manually
  }

  let title = metaContent(html, meta("og:title"));
  let author = metaContent(html, [
    ...meta("books:author"),
    ...meta("author"),
    /"author"\s*:\s*\[?\s*{[^}]*"name"\s*:\s*"([^"]+)"/i,
  ]);
  // StoryGraph titles arrive as "Title by Author"; split when author is
  // otherwise unknown.
  if (!author && / by /.test(title)) {
    const at = title.lastIndexOf(" by ");
    author = title.slice(at + 4).trim();
    title = title.slice(0, at).trim();
  }

  return Response.json(
    {
      fetched: html.length > 0,
      source,
      title,
      author,
      coverUrl: metaContent(html, meta("og:image")),
      description: metaContent(html, meta("og:description")).slice(0, 2000),
    },
    { headers: NO_STORE },
  );
}
