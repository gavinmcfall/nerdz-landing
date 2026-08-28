import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuthEnv } from "@/lib/auth/env";
import { readSession } from "@/lib/auth/session";
import { getGuide } from "@/lib/reading";
import {
  MAX_PROGRESS_BODY_BYTES,
  ProgressBodySchema,
  emptyProgress,
  progressKey,
  sanitizeChecked,
  type ProgressRecord,
} from "@/lib/reading-sync";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

async function requireContext(req: Request, guideSlug: string | null) {
  const guide = guideSlug ? await getGuide(guideSlug) : null;
  if (!guide) {
    return { error: Response.json({ error: "unknown guide" }, { status: 404, headers: NO_STORE }) };
  }
  let env;
  try {
    env = await getAuthEnv();
  } catch {
    return { error: Response.json({ error: "sync not configured" }, { status: 503, headers: NO_STORE }) };
  }
  const session = await readSession(req, env.AUTH_SECRET);
  if (!session) {
    return { error: Response.json({ error: "not signed in" }, { status: 401, headers: NO_STORE }) };
  }
  const kv = (await getCloudflareContext({ async: true })).env.READING_SYNC;
  if (!kv) {
    return { error: Response.json({ error: "storage unavailable" }, { status: 503, headers: NO_STORE }) };
  }
  return { guide, uid: session.uid, kv };
}

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("guide");
  const ctx = await requireContext(req, slug);
  if ("error" in ctx) return ctx.error;

  const stored = (await ctx.kv.get(
    progressKey(ctx.uid, ctx.guide.slug),
    "json",
  )) as ProgressRecord | null;
  return Response.json(stored ?? emptyProgress(), { headers: NO_STORE });
}

export async function PUT(req: Request) {
  const slug = new URL(req.url).searchParams.get("guide");
  const ctx = await requireContext(req, slug);
  if ("error" in ctx) return ctx.error;

  const raw = await req.text();
  if (raw.length > MAX_PROGRESS_BODY_BYTES) {
    return Response.json({ error: "too large" }, { status: 413, headers: NO_STORE });
  }
  let parsed;
  try {
    parsed = ProgressBodySchema.safeParse(JSON.parse(raw));
  } catch {
    parsed = { success: false as const, error: null };
  }
  if (!parsed.success) {
    return Response.json({ error: "bad body" }, { status: 400, headers: NO_STORE });
  }

  const record: ProgressRecord = {
    v: 1,
    checked: sanitizeChecked(ctx.guide, parsed.data.checked),
    updatedAt: new Date().toISOString(),
  };
  await ctx.kv.put(progressKey(ctx.uid, ctx.guide.slug), JSON.stringify(record));
  return Response.json(record, { headers: NO_STORE });
}
