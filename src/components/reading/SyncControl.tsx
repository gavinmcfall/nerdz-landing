"use client";

import { useEffect, useRef, useState } from "react";

// Sign-in/sync affordance for the reading progress bar. Renders one compact
// button reflecting sync state; clicking opens a popover with the provider
// buttons (signed out) or status + sign-out (signed in). The ⓘ tooltip is
// the privacy promise — keep its copy in lockstep with what the API stores
// (an opaque id, nothing else).

export type SyncStatus =
  | { state: "loading" }
  | { state: "local" }
  | { state: "synced"; provider: "google" | "discord" }
  | { state: "offline"; provider: "google" | "discord" };

const PROVIDER_LABEL = { google: "Google", discord: "Discord" } as const;

const PRIVACY_COPY =
  "Signing in only gives us an anonymous account number so your reading " +
  "progress can follow you between devices. No name, no email, nothing " +
  "else is collected or shared.";

export function SyncControl({
  status,
  authError,
  onSignOut,
}: {
  status: SyncStatus;
  authError: boolean;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const loginHref = (provider: "google" | "discord") =>
    `/api/auth/login/${provider}?from=${encodeURIComponent(
      window.location.pathname,
    )}`;

  const label =
    status.state === "loading"
      ? "…"
      : status.state === "local"
        ? "Sign in to sync"
        : status.state === "offline"
          ? "Sync offline"
          : "Syncing ✓";

  return (
    <div className="rg-sync" ref={rootRef}>
      <button
        className={`rg-btn rg-sync__toggle${status.state === "synced" ? " rg-sync__toggle--on" : ""}`}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>

      {open && (
        <div className="rg-sync__pop">
          {status.state === "local" || status.state === "loading" ? (
            <>
              <p className="rg-sync__lede">
                Sync your ticks across devices
                <span className="rg-tip">
                  <span className="rg-tip__icon" tabIndex={0} aria-label="Privacy note">
                    ⓘ
                  </span>
                  <span className="rg-tip__bubble" role="tooltip">
                    {PRIVACY_COPY}
                  </span>
                </span>
              </p>
              {authError && (
                <p className="rg-sync__error">
                  Sign-in didn&rsquo;t complete — give it another go.
                </p>
              )}
              {/* Full-page redirects, not fetch — the provider must own the top-level page. */}
              <a className="rg-btn rg-sync__provider" href={loginHref("google")}>
                Continue with Google
              </a>
              <a className="rg-btn rg-sync__provider" href={loginHref("discord")}>
                Continue with Discord
              </a>
            </>
          ) : (
            <>
              <p className="rg-sync__lede">
                {status.state === "offline"
                  ? "Signed in, but the last save didn't reach the server — it'll retry on your next tick."
                  : `Progress syncs to this device and any other where you sign in with ${PROVIDER_LABEL[status.provider]}.`}
              </p>
              <button className="rg-btn" type="button" onClick={onSignOut}>
                Sign out (back to this-browser-only)
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
