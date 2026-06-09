import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { remarkMermaid } from './src/lib/remark-mermaid';
import { velvetDark, velvetLight } from './src/lib/velvet-shiki-theme';

// Fumadocs collection for the /guides surface (Pattern B, multi-root).
// Content lives under src/content/guides/<guide>/<chapter>.mdx; each guide
// folder has a meta.json with root:true so it becomes a sidebar tab. The
// landing tab is `home` (which renders <GuideCards />).
export const docs = defineDocs({
  dir: 'src/content/guides',
});

export default defineConfig({
  mdxOptions: {
    // ```mermaid fences → <Mermaid chart="..."/> (client-side SVG).
    // Run BEFORE rehype-code so Shiki never lexes the mermaid source.
    remarkPlugins: (v) => [remarkMermaid, ...v],
    // Custom Shiki theme that pulls from shell-tokens (velvet palette).
    // dark = default surface; light = the [data-theme="light"] surface.
    rehypeCodeOptions: {
      themes: {
        dark: velvetDark,
        light: velvetLight,
      },
    },
  },
});
