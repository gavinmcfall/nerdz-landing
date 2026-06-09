import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

// Remark plugin: transform ```mermaid fences into <Mermaid chart="..." />
// elements so the Mermaid client component (registered in mdx-components)
// can render them as SVG diagrams instead of leaking the source as a code
// block. Runs BEFORE rehype-code so Shiki never sees these blocks.
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || !parent || typeof index !== 'number') {
        return;
      }
      (parent.children as unknown[]).splice(index, 1, {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'chart',
            value: node.value,
          },
        ],
        children: [],
      });
    });
  };
}
