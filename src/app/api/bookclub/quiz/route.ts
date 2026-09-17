import { NO_STORE, clubContext, requireAdmin } from "@/lib/bookclub-server";
import {
  KV_ADMINS,
  SaveQuizSchema,
  kvQuizKey,
  sanitizeAnswers,
  type QuizDoc,
} from "@/lib/bookclub";

export const dynamic = "force-dynamic";

// Save the caller's latest quiz answers (retake overwrites). Saving also
// refreshes the caller's display name on the admins doc, so the name shown
// in the match-up is whatever they last chose.
export async function PUT(req: Request) {
  const ctx = await clubContext(req);
  if (ctx instanceof Response) return ctx;
  const denied = requireAdmin(ctx);
  if (denied) return denied;

  const parsed = SaveQuizSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "bad body" }, { status: 400, headers: NO_STORE });
  }

  const doc: QuizDoc = {
    v: 1,
    name: parsed.data.name.trim(),
    answers: sanitizeAnswers(parsed.data.answers),
    updatedAt: new Date().toISOString(),
  };
  await ctx.kv.put(kvQuizKey(ctx.admin!.uid), JSON.stringify(doc));

  if (doc.name && doc.name !== ctx.admin!.name) {
    ctx.admins.admins = ctx.admins.admins.map((a) =>
      a.uid === ctx.admin!.uid ? { ...a, name: doc.name } : a,
    );
    await ctx.kv.put(KV_ADMINS, JSON.stringify(ctx.admins));
  }

  return Response.json(
    { name: doc.name, answers: doc.answers, updatedAt: doc.updatedAt },
    { headers: NO_STORE },
  );
}
