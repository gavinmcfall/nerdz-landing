// Nav manifest — the canonical shared-shell nav (docs/unified-shell-spec.md §3).
// Home is carried by the brand mark, so the nav starts at projects.
// "blog" routing is feature-flagged (see lib/flags.ts): the live subdomain
// until the same-origin /blog edge route ships (plan 5).
import { blogLink } from "./flags";

export type NavItem = {
  label: string;
  href: string;
  cta?: boolean;
  external?: boolean;
};

export const NAV: NavItem[] = [
  { label: "projects", href: "/projects" },
  { label: "field manuals", href: "/manuals" },
  { label: "blog", href: blogLink.href, external: blogLink.external },
  { label: "about", href: "/about" },
  {
    label: "github →",
    href: "https://github.com/gavinmcfall",
    cta: true,
    external: true,
  },
];

// Active when the current path is the item's route or nested under it
// (e.g. /manuals active for /manuals/some-slug). External items never match.
export function isActive(pathname: string, item: NavItem): boolean {
  if (item.external) return false;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
