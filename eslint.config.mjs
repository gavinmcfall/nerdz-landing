import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated output: the OpenNext Worker bundle and Fumadocs' collections.
    ".open-next/**",
    ".wrangler/**",
    ".source/**",
  ]),
  {
    // Pages use plain <img>: on Cloudflare Workers next/image needs a paid
    // Cloudflare Images setup to resize, and the site doesn't have one.
    rules: { "@next/next/no-img-element": "off" },
  },
]);

export default eslintConfig;
