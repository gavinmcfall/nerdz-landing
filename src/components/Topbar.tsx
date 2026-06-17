"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, isActive, type NavItem } from "@/lib/nav";
import { ThemeToggle } from "./ThemeToggle";

// Inline GitHub mark — single-path Octocat, currentColor so it picks up theme.
function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

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
    const classes = [item.cta ? "cta" : null, item.icon ? "shell-topbar__icon-link" : null]
      .filter(Boolean)
      .join(" ") || undefined;
    const body = item.icon === "github" ? <GitHubIcon /> : item.label;
    if (item.external) {
      return (
        <a
          href={item.href}
          className={classes}
          aria-label={item.icon ? item.label : undefined}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => setOpen(false)}
        >
          {body}
        </a>
      );
    }
    return (
      <Link
        href={item.href}
        className={classes}
        aria-current={isActive(pathname, item) ? "page" : undefined}
        aria-label={item.icon ? item.label : undefined}
        onClick={() => setOpen(false)}
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
