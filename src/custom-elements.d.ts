import type { DetailedHTMLProps, HTMLAttributes } from "react";

// Lets TSX use the framework-agnostic <nerdz-status> custom element
// (defined in /public/nerdz-status.js, registered at runtime).
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "nerdz-status": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
