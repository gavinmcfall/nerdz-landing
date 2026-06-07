"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, isActive, type NavItem } from "@/lib/nav";
import { ThemeToggle } from "./ThemeToggle";

// The shared shell header. Markup follows the contract in
// docs/unified-shell-spec.md §2 — the rendered DOM is a plain <a> either way,
// so the Hugo blog mirrors it; React uses <Link> for app-internal routes to get
// prefetched, client-side SPA navigation (external links stay a plain <a>).
// The live telemetry pill is the framework-agnostic <nerdz-status> element.
export function Topbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Icon glyphs for nav items that render as a logo rather than text.
  const NavIcon = ({ name }: { name: NonNullable<NavItem["icon"]> }) => {
    if (name === "github") {
      return (
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 .5a11.5 11.5 0 0 0-3.63 22.42c.58.1.78-.25.78-.56v-2c-3.2.69-3.87-1.36-3.87-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.55-.29-5.24-1.27-5.24-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.57.24 2.73.12 3.02.73.8 1.18 1.82 1.18 3.07 0 4.39-2.69 5.36-5.25 5.64.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.55A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
      );
    }
    return null;
  };

  // Renders a nav destination: <Link> for app routes, <a> for external.
  const NavItemLink = ({ item }: { item: NavItem }) => {
    const className = [item.cta ? "cta" : undefined, item.icon ? "icon-only" : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
    const body = item.icon ? <NavIcon name={item.icon} /> : item.label;
    if (item.external) {
      return (
        <a
          href={item.href}
          className={className}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => setOpen(false)}
          aria-label={item.icon ? item.label : undefined}
          title={item.icon ? item.label : undefined}
        >
          {body}
        </a>
      );
    }
    return (
      <Link
        href={item.href}
        className={className}
        aria-current={isActive(pathname, item) ? "page" : undefined}
        onClick={() => setOpen(false)}
        aria-label={item.icon ? item.label : undefined}
        title={item.icon ? item.label : undefined}
      >
        {body}
      </Link>
    );
  };

  return (
    <>
      <a className="shell-skip" href="#main">
        Skip to content
      </a>
      <header className="shell-topbar">
        <div className="frame shell-topbar__inner">
          <Link className="shell-topbar__brand" href="/">
            <span className="shell-topbar__dot" aria-hidden="true" />
            nerdz.cloud
          </Link>

          <nerdz-status className="shell-topbar__status mono" />

          <nav className="shell-topbar__nav" aria-label="Primary">
            {NAV.map((item) => (
              <NavItemLink key={item.label} item={item} />
            ))}
            <ThemeToggle />
          </nav>

          <button
            className="shell-topbar__menu"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="shell-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            ≡
          </button>
        </div>

        <nav
          id="shell-drawer"
          className="shell-drawer"
          aria-label="Primary"
          hidden={!open}
        >
          {NAV.map((item) => (
            <NavItemLink key={item.label} item={item} />
          ))}
          <ThemeToggle />
        </nav>
      </header>
    </>
  );
}
