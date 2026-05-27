import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `output: "standalone"` — @opennextjs/cloudflare wraps the standard
  // Next build and emits a Cloudflare Worker instead of a Node server.
  reactCompiler: true,
};

export default nextConfig;

// Enable Cloudflare bindings (R2/KV/etc.) during `next dev`. No-op in the
// production worker build.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
