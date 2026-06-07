import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { GuideCards } from '@/components/GuideCards';
import { Mermaid } from '@/components/Mermaid';

// MDX component map for Fumadocs-rendered chapters.
//   <GuideCards /> — auto-card grid of every root guide; used by the
//                    /guides landing so adding a guide doesn't need edits.
//   <Mermaid />    — client-side mermaid diagram renderer; injected by the
//                    remark-mermaid plugin so ```mermaid fences become SVGs.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    GuideCards,
    Mermaid,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;
