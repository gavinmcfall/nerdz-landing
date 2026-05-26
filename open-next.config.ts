import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: the hub's only server work is API routes proxying
// kromgo + blog RSS with short fetch revalidate. No persistent ISR cache
// needed — re-fetching live telemetry is the desired behaviour — so we
// run with the default (in-worker) cache.
export default defineCloudflareConfig();
