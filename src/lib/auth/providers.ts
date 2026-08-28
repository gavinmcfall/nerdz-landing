import { base64UrlToUtf8 } from "./crypto";
import type { Provider } from "./session";
import type { AuthEnv } from "./env";

// Provider adapters for the authorization-code + PKCE flow. Each returns the
// ONLY thing we keep: an opaque uid ("google:<sub>" / "discord:<id>").
// Scopes are deliberately minimal — Google `openid` (no email/profile),
// Discord `identify` (no email). Transient token responses are discarded.

type ProviderConfig = {
  authorizeEndpoint: string;
  tokenEndpoint: string;
  scope: string;
  clientId: (env: AuthEnv) => string;
  clientSecret: (env: AuthEnv) => string;
  /** Exchange result → opaque uid (without provider prefix). */
  extractId: (tokenJson: Record<string, unknown>) => Promise<string>;
};

async function discordUserId(tokenJson: Record<string, unknown>): Promise<string> {
  const accessToken = tokenJson.access_token;
  if (typeof accessToken !== "string") throw new Error("discord: no access_token");
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`discord /users/@me ${res.status}`);
  const me = (await res.json()) as { id?: string };
  if (!me.id) throw new Error("discord: no user id");
  return me.id;
}

async function googleSub(tokenJson: Record<string, unknown>): Promise<string> {
  // The id_token arrives over direct TLS from Google's token endpoint, so
  // decoding its payload without JWKS signature verification is sound here.
  const idToken = tokenJson.id_token;
  if (typeof idToken !== "string") throw new Error("google: no id_token");
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("google: malformed id_token");
  const claims = JSON.parse(base64UrlToUtf8(parts[1])) as { sub?: string };
  if (!claims.sub) throw new Error("google: no sub claim");
  return claims.sub;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  google: {
    authorizeEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    scope: "openid",
    clientId: (env) => env.GOOGLE_CLIENT_ID,
    clientSecret: (env) => env.GOOGLE_CLIENT_SECRET,
    extractId: googleSub,
  },
  discord: {
    authorizeEndpoint: "https://discord.com/oauth2/authorize",
    tokenEndpoint: "https://discord.com/api/oauth2/token",
    scope: "identify",
    clientId: (env) => env.DISCORD_CLIENT_ID,
    clientSecret: (env) => env.DISCORD_CLIENT_SECRET,
    extractId: discordUserId,
  },
};

export function isProvider(p: string): p is Provider {
  return p === "google" || p === "discord";
}

export function authorizeUrl(
  provider: Provider,
  env: AuthEnv,
  opts: { redirectUri: string; state: string; codeChallenge: string },
): string {
  const cfg = PROVIDERS[provider];
  const url = new URL(cfg.authorizeEndpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", cfg.clientId(env));
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("scope", cfg.scope);
  url.searchParams.set("state", opts.state);
  url.searchParams.set("code_challenge", opts.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (provider === "discord") url.searchParams.set("prompt", "none");
  return url.toString();
}

/** Exchange the code; returns the prefixed opaque uid. */
export async function exchangeCode(
  provider: Provider,
  env: AuthEnv,
  opts: { code: string; verifier: string; redirectUri: string },
): Promise<string> {
  const cfg = PROVIDERS[provider];
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: cfg.clientId(env),
    client_secret: cfg.clientSecret(env),
    code_verifier: opts.verifier,
  });
  const res = await fetch(cfg.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`${provider} token exchange failed: ${res.status}`);
  }
  const tokenJson = (await res.json()) as Record<string, unknown>;
  const id = await PROVIDERS[provider].extractId(tokenJson);
  return `${provider}:${id}`;
}
