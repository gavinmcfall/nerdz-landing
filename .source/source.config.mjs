// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";

// src/lib/remark-mermaid.ts
import { visit } from "unist-util-visit";
function remarkMermaid() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "mermaid" || !parent || typeof index !== "number") {
        return;
      }
      parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "Mermaid",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "chart",
            value: node.value
          }
        ],
        children: []
      });
    });
  };
}

// src/lib/velvet-shiki-theme.ts
var velvetDark = {
  name: "velvet-dark",
  type: "dark",
  colors: {
    "editor.background": "#0a0712",
    "editor.foreground": "#f1e8d6"
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#a39a85", fontStyle: "italic" } },
    { scope: ["string", "string.quoted", "punctuation.definition.string"], settings: { foreground: "#c9a86e" } },
    { scope: ["string.template", "meta.embedded"], settings: { foreground: "#d9b97f" } },
    { scope: ["constant.language", "constant.numeric", "constant.other.symbol"], settings: { foreground: "#c084fc" } },
    { scope: ["keyword", "keyword.control", "keyword.operator.new", "storage.type", "storage.modifier"], settings: { foreground: "#a855f7" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call.generic"], settings: { foreground: "#c084fc" } },
    { scope: ["entity.name.tag", "entity.name.type", "support.type"], settings: { foreground: "#a855f7" } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: "#c9a86e" } },
    { scope: ["variable", "variable.parameter", "variable.other.readwrite"], settings: { foreground: "#d8cfb9" } },
    { scope: ["variable.language.this", "variable.language.self"], settings: { foreground: "#a855f7", fontStyle: "italic" } },
    { scope: ["punctuation", "meta.brace", "meta.delimiter"], settings: { foreground: "#a39a85" } },
    { scope: ["markup.heading", "markup.bold"], settings: { foreground: "#f1e8d6", fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    { scope: ["markup.inserted"], settings: { foreground: "#c084fc" } },
    { scope: ["markup.deleted"], settings: { foreground: "#c9a86e" } }
  ]
};
var velvetLight = {
  name: "velvet-light",
  type: "light",
  colors: {
    "editor.background": "#efe6d2",
    "editor.foreground": "#1a141f"
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#5e5468", fontStyle: "italic" } },
    { scope: ["string", "string.quoted", "punctuation.definition.string"], settings: { foreground: "#8a7547" } },
    { scope: ["constant.language", "constant.numeric"], settings: { foreground: "#5a0e93" } },
    { scope: ["keyword", "keyword.control", "storage.type", "storage.modifier"], settings: { foreground: "#5a0e93" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "#6A0DAD" } },
    { scope: ["entity.name.tag", "entity.name.type", "support.type"], settings: { foreground: "#5a0e93" } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: "#8a7547" } },
    { scope: ["variable", "variable.parameter"], settings: { foreground: "#2a2230" } },
    { scope: ["punctuation", "meta.brace"], settings: { foreground: "#5e5468" } },
    { scope: ["markup.heading", "markup.bold"], settings: { foreground: "#1a141f", fontStyle: "bold" } }
  ]
};

// source.config.ts
var docs = defineDocs({
  dir: "src/content/guides"
});
var source_config_default = defineConfig({
  mdxOptions: {
    // ```mermaid fences → <Mermaid chart="..."/> (client-side SVG).
    // Run BEFORE rehype-code so Shiki never lexes the mermaid source.
    remarkPlugins: (v) => [remarkMermaid, ...v],
    // Custom Shiki theme that pulls from shell-tokens (velvet palette).
    // dark = default surface; light = the [data-theme="light"] surface.
    rehypeCodeOptions: {
      themes: {
        dark: velvetDark,
        light: velvetLight
      }
    }
  }
});
export {
  source_config_default as default,
  docs
};
