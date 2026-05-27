"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Re-keying on pathname remounts children on each route change, re-firing the
// entry animation — a lightweight page-change transition for SPA navigations.
// The cross-document app↔blog crossover uses the native @view-transition opt-in
// instead (docs/unified-shell-spec.md §5).
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  );
}
