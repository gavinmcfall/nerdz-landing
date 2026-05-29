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

  // Renders a nav destination: <Link> for app routes, <a> for external.
  const NavItemLink = ({ item }: { item: NavItem }) => {
    const className = item.cta ? "cta" : undefined;
    if (item.external) {
      return (
        <a
          href={item.href}
          className={className}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => setOpen(false)}
        >
          {item.label}
        </a>
      );
    }
    return (
      <Link
        href={item.href}
        className={className}
        aria-current={isActive(pathname, item) ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {item.label}
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
