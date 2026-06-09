import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

// Shared layout options for the Fumadocs DocsLayout. The shell's Topbar/
// Colophon already wrap every route via src/app/layout.tsx — keep this minimal
// so we don't double-render brand/nav.
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Guides',
      // The outer shell carries the brand; this is just the sidebar header.
      url: '/guides',
    },
  };
}
