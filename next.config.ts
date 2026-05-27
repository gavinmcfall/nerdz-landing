import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    // Strip YAML frontmatter from rendered MDX output — it's parsed separately
    // by gray-matter (src/lib/manuals.ts) for metadata and must not leak into
    // the page body. String-form plugin so Turbopack can serialize the option.
    remarkPlugins: [["remark-frontmatter", ["yaml"]]],
  },
});

const nextConfig: NextConfig = {
  // No `output: "standalone"` — @opennextjs/cloudflare wraps the standard
  // Next build and emits a Cloudflare Worker instead of a Node server.
  reactCompiler: true,
  // Field manuals are .mdx (src/manuals/*.mdx, rendered at /manuals/[slug]).
  pageExtensions: ["ts", "tsx", "mdx"],
};

export default withMDX(nextConfig);

// Enable Cloudflare bindings (R2/KV/etc.) during `next dev`. No-op in the
// production worker build.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
