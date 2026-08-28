import {
  base64UrlToUtf8,
  hmacSign,
  timingSafeEqual,
  utf8ToBase64Url,
} from "./crypto";

// Sealed-cookie sessions: base64url(JSON payload) + "." + HMAC-SHA256 sig.
// No server-side session store — the cookie IS the session; AUTH_SECRET
// rotation invalidates all of them at once. The uid inside is the only
// identity we ever hold: "google:<sub>" or "discord:<id>".

export const SESSION_COOKIE = "nerdz_session";
export const LOGIN_COOKIE = "nerdz_oauth";
export const SESSION_MAX_AGE = 180 * 24 * 60 * 60; // 180 days
export const LOGIN_MAX_AGE = 10 * 60; // state+PKCE cookie: 10 minutes

export type Provider = "google" | "discord";

export type SessionPayload = {
  uid: string;
  provider: Provider;
  iat: number;
  exp: number;
};

export type LoginPayload = {
  state: string;
  verifier: string;
  from: string;
  provider: Provider;
  exp: number;
};

export async function sealCookie(
  secret: string,
  payload: object,
): Promise<string> {
  const body = utf8ToBase64Url(JSON.stringify(payload));
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function openCookie<T extends { exp: number }>(
  secret: string,
  value: string | undefined,
): Promise<T | null> {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = await hmacSign(secret, body);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(base64UrlToUtf8(body)) as T;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function cookieValue(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return undefined;
}

export async function readSession(
  req: Request,
  secret: string,
): Promise<SessionPayload | null> {
  const payload = await openCookie<SessionPayload>(
    secret,
    cookieValue(req, SESSION_COOKIE),
  );
  if (!payload || typeof payload.uid !== "string" || !payload.uid) return null;
  return payload;
}

export async function readLoginCookie(
  req: Request,
  secret: string,
): Promise<LoginPayload | null> {
  return openCookie<LoginPayload>(secret, cookieValue(req, LOGIN_COOKIE));
}

// Set-Cookie helpers. Secure is dropped on plain-http localhost dev.
function secureAttr(req: Request): string {
  return new URL(req.url).protocol === "https:" ? " Secure;" : "";
}

export function setCookieHeader(
  req: Request,
  name: string,
  value: string,
  maxAgeSec: number,
): string {
  return `${name}=${value}; Path=/; HttpOnly;${secureAttr(req)} SameSite=Lax; Max-Age=${maxAgeSec}`;
}

export function clearCookieHeader(req: Request, name: string): string {
  return `${name}=; Path=/; HttpOnly;${secureAttr(req)} SameSite=Lax; Max-Age=0`;
}

/** Only same-origin relative paths may be used as post-login redirects. */
export function safeReturnPath(from: string | null): string {
  if (from && /^\/(?!\/)/.test(from)) return from;
  return "/reading";
}
