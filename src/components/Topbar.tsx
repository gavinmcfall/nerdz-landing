"use client";

import { useState } from "react";
import { NAV } from "@/lib/nav";

// The shared shell header. Markup follows the contract in
// docs/unified-shell-spec.md §2 (class names mirrored by the Hugo blog).
// The live telemetry pill is the framework-agnostic <nerdz-status> element
// (/public/nerdz-status.js) — same tag in both runtimes.
export function Topbar() {
  const [open, setOpen] = useState(false);

  const linkProps = (item: (typeof NAV)[number]) => ({
    href: item.href,
    className: item.cta ? "cta" : undefined,
    ...(item.external
      ? { target: "_blank", rel: "noreferrer noopener" }
      : {}),
  });

  return (
    <>
      <a className="shell-skip" href="#main">
        Skip to content
      </a>
      <header className="shell-topbar">
        <div className="frame shell-topbar__inner">
          <a className="shell-topbar__brand" href="/">
            <span className="shell-topbar__dot" aria-hidden="true" />
            nerdz.cloud
          </a>

          <nerdz-status className="shell-topbar__status mono" />

          <nav className="shell-topbar__nav" aria-label="Primary">
            {NAV.map((item) => (
              <a key={item.label} {...linkProps(item)}>
                {item.label}
              </a>
            ))}
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
            <a
              key={item.label}
              {...linkProps(item)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>
    </>
  );
}
