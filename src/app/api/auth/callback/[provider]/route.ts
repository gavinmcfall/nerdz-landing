import { getAuthEnv } from "@/lib/auth/env";
import { timingSafeEqual } from "@/lib/auth/crypto";
import { exchangeCode, isProvider } from "@/lib/auth/providers";
import {
  LOGIN_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  clearCookieHeader,
  readLoginCookie,
  safeReturnPath,
  sealCookie,
  setCookieHeader,
  type SessionPayload,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// OAuth return leg: verify state against the sealed login cookie, exchange
// the code (server-side, with PKCE verifier), keep ONLY the opaque uid in a
// long-lived sealed session cookie, and bounce back to where the user was.
// Every failure path lands back on `from` with ?auth_error=1 — never a bare
// error page mid-flow.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isProvider(provider)) {
    return new Response("Unknown provider", { status: 404 });
  }

  let env;
  try {
    env = await getAuthEnv();
  } catch {
    return new Response("Sign-in not configured", { status: 503 });
  }

  const url = new URL(req.url);
  const login = await readLoginCookie(req, env.AUTH_SECRET);
  const fail = (from: string | null) =>
    new Response(null, {
      status: 302,
      headers: {
        Location: `${safeReturnPath(from)}?auth_error=1`,
        "Set-Cookie": clearCookieHeader(req, LOGIN_COOKIE),
        "Cache-Control": "no-store",
      },
    });

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (
    !login ||
    login.provider !== provider ||
    !code ||
    !state ||
    !timingSafeEqual(state, login.state)
  ) {
    return fail(login?.from ?? null);
  }

  let uid: string;
  try {
    uid = await exchangeCode(provider, env, {
      code,
      verifier: login.verifier,
      redirectUri: `${url.origin}/api/auth/callback/${provider}`,
    });
  } catch {
    return fail(login.from);
  }

  const now = Math.floor(Date.now() / 1000);
  const session: SessionPayload = {
    uid,
    provider,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  };

  const headers = new Headers({
    Location: safeReturnPath(login.from),
    "Cache-Control": "no-store",
  });
  headers.append(
    "Set-Cookie",
    setCookieHeader(
      req,
      SESSION_COOKIE,
      await sealCookie(env.AUTH_SECRET, session),
      SESSION_MAX_AGE,
    ),
  );
  headers.append("Set-Cookie", clearCookieHeader(req, LOGIN_COOKIE));
  return new Response(null, { status: 302, headers });
}
