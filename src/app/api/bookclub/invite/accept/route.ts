import { NO_STORE, clubContext } from "@/lib/bookclub-server";
import { AcceptInviteSchema, KV_ADMINS, kvInviteKey } from "@/lib/bookclub";

export const dynamic = "force-dynamic";

// Redeem an invite: any signed-in visitor with a live code becomes a club
// admin under the name they choose. Codes are single-use (deleted here)
// and expire via KV TTL.
export async function POST(req: Request) {
  const ctx = await clubContext(req);
  if (ctx instanceof Response) return ctx;
  if (!ctx.session) {
    return Response.json(
      { error: "sign in first, then use the invite link again" },
      { status: 401, headers: NO_STORE },
    );
  }

  const parsed = AcceptInviteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "bad body" }, { status: 400, headers: NO_STORE });
  }

  if (ctx.admin) {
    return Response.json({ ok: true, already: true }, { headers: NO_STORE });
  }

  const invite = await ctx.kv.get(kvInviteKey(parsed.data.code), "json");
  if (!invite) {
    return Response.json(
      { error: "invite invalid or expired" },
      { status: 403, headers: NO_STORE },
    );
  }

  await ctx.kv.delete(kvInviteKey(parsed.data.code));
  ctx.admins.admins.push({
    uid: ctx.session.uid,
    name: parsed.data.name.trim(),
  });
  await ctx.kv.put(KV_ADMINS, JSON.stringify(ctx.admins));
  return Response.json({ ok: true }, { headers: NO_STORE });
}
