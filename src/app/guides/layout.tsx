import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';

// Spike: Fumadocs DocsLayout scoped to /manuals/lighthouse/*. The outer shell
// (Topbar + Colophon) is provided by src/app/layout.tsx — this layer just
// adds the sidebar nav and content rail for the multi-chapter guide.
export default function LighthouseManualLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={{ enabled: false }}>
      <DocsLayout {...baseOptions()} tree={source.pageTree}>
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
