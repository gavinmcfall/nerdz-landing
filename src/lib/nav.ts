// Nav manifest — transcription of the shared shell's nav.
//
// The CANONICAL TARGET manifest is docs/unified-shell-spec.md §3:
//   home · projects · field manuals · blog · about · github →
// Those point at real routes (/projects, /manuals, /blog, /about) that don't
// exist yet. Plan 1 ("extract the shell") keeps the live one-pager's anchors
// so the hub stays unbroken; plan 2 ("route the landing") swaps these for the
// real routes and wires active state (aria-current) against the manifest.
export type NavItem = {
  label: string;
  href: string;
  cta?: boolean;
  external?: boolean;
};

export const NAV: NavItem[] = [
  { label: "projects", href: "#projects" },
  { label: "workbench", href: "#workbench" },
  { label: "ramblings", href: "#ramblings" },
  {
    label: "github →",
    href: "https://github.com/gavinmcfall",
    cta: true,
    external: true,
  },
];
