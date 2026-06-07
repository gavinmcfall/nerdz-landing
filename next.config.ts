import type { NextConfig } from "next";
import { createMDX as createFumadocsMDX } from "fumadocs-mdx/next";

// Spike: Fumadocs MDX is the SOLE MDX wrapper. Chaining @next/mdx alongside
// silently strips Fumadocs' frontmatter export pipeline so page.data.title
// goes undefined. Existing /manuals/* one-pagers (src/manuals/*.mdx) keep
// working because Fumadocs' loader handles arbitrary .mdx imports too — but
// keep an eye on that during the migration.
const withFumadocs = createFumadocsMDX();

const nextConfig: NextConfig = {
  // No `output: "standalone"` — @opennextjs/cloudflare wraps the standard
  // Next build and emits a Cloudflare Worker instead of a Node server.
  reactCompiler: true,
  // Field manuals are .mdx (src/manuals/*.mdx, rendered at /manuals/[slug]).
  pageExtensions: ["ts", "tsx", "mdx"],
};

export default withFumadocs(nextConfig);

// Enable Cloudflare bindings (R2/KV/etc.) during `next dev`. No-op in the
// production worker build.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
