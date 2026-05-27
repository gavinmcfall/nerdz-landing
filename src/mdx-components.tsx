import type { MDXComponents } from "mdx/types";
import { CopyButton } from "@/components/CopyButton";
import type { HTMLAttributes } from "react";

// Mandatory for @next/mdx in App Router. Maps HTML element tags emitted by
// MDX to React components. We override <pre> to wrap with a copy button and
// <a> to add safe target=_blank for external links.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props: HTMLAttributes<HTMLPreElement>) => {
      // Extract raw text from the <code> child so the copy button knows what
      // to put on the clipboard. Children can be a single ReactElement<code>.
      const codeText = extractText(props.children);
      return (
        <pre {...props}>
          {codeText ? <CopyButton text={codeText} /> : null}
          {props.children}
        </pre>
      );
    },
    a: ({ href, ...rest }) => {
      const external = href?.startsWith("http");
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer noopener" : undefined}
          {...rest}
        />
      );
    },
  };
}

function extractText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    if (props?.children !== undefined) return extractText(props.children);
  }
  return "";
}
