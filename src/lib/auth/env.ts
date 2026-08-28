import { getCloudflareContext } from "@opennextjs/cloudflare";

// Auth secrets, read from the Worker environment (wrangler secrets in prod,
// .dev.vars under `next dev`/miniflare). process.env fallback covers plain
// node contexts (build-time imports never call this at module load).

export type AuthEnv = {
  AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
};

const KEYS: (keyof AuthEnv)[] = [
  "AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
];

export async function getAuthEnv(): Promise<AuthEnv> {
  let cfEnv: Record<string, unknown> = {};
  try {
    cfEnv = (await getCloudflareContext({ async: true }))
      .env as unknown as Record<string, unknown>;
  } catch {
    // Not on the Worker (e.g. bare node) — fall through to process.env.
  }
  const out = {} as AuthEnv;
  const missing: string[] = [];
  for (const key of KEYS) {
    const value =
      (typeof cfEnv[key] === "string" && (cfEnv[key] as string)) ||
      process.env[key] ||
      "";
    if (!value) missing.push(key);
    out[key] = value;
  }
  if (missing.length) {
    throw new Error(
      `auth env incomplete — missing ${missing.join(", ")} (wrangler secret put / .dev.vars)`,
    );
  }
  return out;
}

/** True when every auth secret is present (used to 503 cleanly pre-setup). */
export async function authConfigured(): Promise<boolean> {
  try {
    await getAuthEnv();
    return true;
  } catch {
    return false;
  }
}
