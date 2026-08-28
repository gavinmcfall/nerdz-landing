import { getAuthEnv } from "@/lib/auth/env";
import { randomToken, sha256Base64Url } from "@/lib/auth/crypto";
import { authorizeUrl, isProvider } from "@/lib/auth/providers";
import {
  LOGIN_COOKIE,
  LOGIN_MAX_AGE,
  safeReturnPath,
  sealCookie,
  setCookieHeader,
  type LoginPayload,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Starts the OAuth dance: seal state + PKCE verifier + return path into a
// short-lived cookie, then bounce to the provider. `from` is restricted to
// same-origin relative paths (open-redirect guard).
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
  const from = safeReturnPath(url.searchParams.get("from"));
  const state = randomToken(24);
  const verifier = randomToken(48);
  const payload: LoginPayload = {
    state,
    verifier,
    from,
    provider,
    exp: Math.floor(Date.now() / 1000) + LOGIN_MAX_AGE,
  };

  const redirectUri = `${url.origin}/api/auth/callback/${provider}`;
  const location = authorizeUrl(provider, env, {
    redirectUri,
    state,
    codeChallenge: await sha256Base64Url(verifier),
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Set-Cookie": setCookieHeader(
        req,
        LOGIN_COOKIE,
        await sealCookie(env.AUTH_SECRET, payload),
        LOGIN_MAX_AGE,
      ),
      "Cache-Control": "no-store",
    },
  });
}
