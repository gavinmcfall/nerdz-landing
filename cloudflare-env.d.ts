// Augments @opennextjs/cloudflare's CloudflareEnv with this app's bindings
// (wrangler.jsonc is the source of truth). Minimal structural types — only
// the KV surface the app actually calls — so we don't need to vendor the
// full generated worker-configuration.d.ts.
declare global {
  interface CloudflareEnv {
    READING_SYNC: {
      get(key: string, type: "json"): Promise<unknown>;
      put(
        key: string,
        value: string,
        options?: { expirationTtl?: number },
      ): Promise<void>;
      delete(key: string): Promise<void>;
    };
    // The site reads the sync's keys and writes only the Forever plan
    // (src/lib/warcraft/plan.ts PLAN_KEY).
    WOW_ARMORY: {
      get(key: string, type: "json"): Promise<unknown>;
      put(key: string, value: string): Promise<void>;
    };
  }
}

export {};
