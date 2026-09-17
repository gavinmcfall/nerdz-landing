import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuthEnv } from "@/lib/auth/env";
import { readSession, type SessionPayload } from "@/lib/auth/session";
import { KV_ADMINS, KV_PICKS, type AdminsDoc, type PicksDoc } from "./bookclub";

// Server-only plumbing for the book-club API routes: resolve the caller's
// session, admin standing, and the KV binding in one call. The opaque uid
// never leaves these modules.

export const NO_STORE = { "Cache-Control": "no-store" };

export type ClubContext = {
  kv: CloudflareEnv["READING_SYNC"];
  session: SessionPayload | null;
  admins: AdminsDoc;
  admin: { uid: string; name: string } | null;
};

export async function clubContext(req: Request): Promise<ClubContext | Response> {
  const kv = (await getCloudflareContext({ async: true })).env.READING_SYNC;
  if (!kv) {
    return Response.json(
      { error: "storage unavailable" },
      { status: 503, headers: NO_STORE },
    );
  }
  let session: SessionPayload | null = null;
  try {
    const env = await getAuthEnv();
    session = await readSession(req, env.AUTH_SECRET);
  } catch {
    // Auth not configured (dev without secrets) — treat as signed out.
  }
  const admins =
    ((await kv.get(KV_ADMINS, "json")) as AdminsDoc | null) ?? {
      v: 1 as const,
      admins: [],
    };
  const admin = session
    ? (admins.admins.find((a) => a.uid === session!.uid) ?? null)
    : null;
  return { kv, session, admins, admin };
}

/** 401 when signed out, 403 when signed in but not a club admin. */
export function requireAdmin(ctx: ClubContext): Response | null {
  if (ctx.admin) return null;
  return Response.json(
    { error: ctx.session ? "not a club admin" : "not signed in" },
    { status: ctx.session ? 403 : 401, headers: NO_STORE },
  );
}

export async function readPicks(kv: ClubContext["kv"]): Promise<PicksDoc> {
  return (
    ((await kv.get(KV_PICKS, "json")) as PicksDoc | null) ?? { v: 1, picks: [] }
  );
}

export async function writePicks(kv: ClubContext["kv"], doc: PicksDoc) {
  // Newest month first, one pick per month enforced by callers.
  doc.picks.sort((a, b) => (a.month < b.month ? 1 : -1));
  await kv.put(KV_PICKS, JSON.stringify(doc));
}
