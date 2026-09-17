import {
  NO_STORE,
  clubContext,
  readPicks,
  requireAdmin,
  writePicks,
} from "@/lib/bookclub-server";
import { MONTH_RE, SavePickSchema, pickSource, type Pick } from "@/lib/bookclub";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Save (upsert by month) or delete the book of a given month. Admin only.
export async function POST(req: Request) {
  const ctx = await clubContext(req);
  if (ctx instanceof Response) return ctx;
  const denied = requireAdmin(ctx);
  if (denied) return denied;

  const parsed = SavePickSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "bad body" }, { status: 400, headers: NO_STORE });
  }
  const source = pickSource(parsed.data.url);
  if (!source) {
    return Response.json(
      { error: "url must be a StoryGraph, Goodreads or Hardcover book page" },
      { status: 400, headers: NO_STORE },
    );
  }

  const pick: Pick = {
    id: `${parsed.data.month}-${source}`,
    month: parsed.data.month,
    title: parsed.data.title,
    author: parsed.data.author ?? "",
    coverUrl: parsed.data.coverUrl ?? "",
    description: parsed.data.description ?? "",
    url: parsed.data.url,
    source,
    addedBy: ctx.admin!.name,
    addedAt: new Date().toISOString(),
  };

  const doc = await readPicks(ctx.kv);
  doc.picks = doc.picks.filter((p) => p.month !== pick.month);
  doc.picks.push(pick);
  await writePicks(ctx.kv, doc);
  return Response.json(pick, { headers: NO_STORE });
}

const DeleteSchema = z.object({ month: z.string().regex(MONTH_RE) });

export async function DELETE(req: Request) {
  const ctx = await clubContext(req);
  if (ctx instanceof Response) return ctx;
  const denied = requireAdmin(ctx);
  if (denied) return denied;

  const parsed = DeleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "bad body" }, { status: 400, headers: NO_STORE });
  }
  const doc = await readPicks(ctx.kv);
  const before = doc.picks.length;
  doc.picks = doc.picks.filter((p) => p.month !== parsed.data.month);
  if (doc.picks.length === before) {
    return Response.json({ error: "no pick that month" }, { status: 404, headers: NO_STORE });
  }
  await writePicks(ctx.kv, doc);
  return Response.json({ ok: true }, { headers: NO_STORE });
}
