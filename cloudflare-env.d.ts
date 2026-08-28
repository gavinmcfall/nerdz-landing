// Augments @opennextjs/cloudflare's CloudflareEnv with this app's bindings
// (wrangler.jsonc is the source of truth). Minimal structural types — only
// the KV surface the app actually calls — so we don't need to vendor the
// full generated worker-configuration.d.ts.
declare global {
  interface CloudflareEnv {
    READING_SYNC: {
      get(key: string, type: "json"): Promise<unknown>;
      put(key: string, value: string): Promise<void>;
      delete(key: string): Promise<void>;
    };
  }
}

export {};
