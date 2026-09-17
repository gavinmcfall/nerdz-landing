import { NO_STORE, clubContext, requireAdmin } from "@/lib/bookclub-server";
import { INVITE_TTL_SECONDS, kvInviteKey } from "@/lib/bookclub";
import { randomToken } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

// Mint a single-use co-admin invite code (7-day TTL via KV expiration).
// The page composes it into a shareable link.
export async function POST(req: Request) {
  const ctx = await clubContext(req);
  if (ctx instanceof Response) return ctx;
  const denied = requireAdmin(ctx);
  if (denied) return denied;

  const code = randomToken(24);
  await ctx.kv.put(kvInviteKey(code), JSON.stringify({ v: 1 }), {
    expirationTtl: INVITE_TTL_SECONDS,
  });
  return Response.json({ code }, { headers: NO_STORE });
}
