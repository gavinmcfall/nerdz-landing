import {
  NO_STORE,
  clubContext,
  readPicks,
} from "@/lib/bookclub-server";
import { kvQuizKey, type QuizDoc } from "@/lib/bookclub";

export const dynamic = "force-dynamic";

// Public club snapshot: picks split into current (newest month <= now is
// close enough for a two-person club — the newest pick IS the club's pick)
// and archive. Admin callers additionally get everyone's latest quiz
// answers and their own standing.
export async function GET(req: Request) {
  const ctx = await clubContext(req);
  if (ctx instanceof Response) return ctx;

  const picks = (await readPicks(ctx.kv)).picks;
  const [current, ...archive] = picks;

  const base = {
    current: current ?? null,
    archive,
    memberNames: ctx.admins.admins.map((a) => a.name),
  };
  if (!ctx.admin) {
    return Response.json({ ...base, isAdmin: false }, { headers: NO_STORE });
  }

  const quizzes = (
    await Promise.all(
      ctx.admins.admins.map(async (a) => {
        const doc = (await ctx.kv.get(kvQuizKey(a.uid), "json")) as QuizDoc | null;
        return doc
          ? {
              name: a.name,
              mine: a.uid === ctx.admin!.uid,
              answers: doc.answers,
              updatedAt: doc.updatedAt,
            }
          : null;
      }),
    )
  ).filter((q) => q !== null);

  return Response.json(
    { ...base, isAdmin: true, me: { name: ctx.admin.name }, quizzes },
    { headers: NO_STORE },
  );
}
