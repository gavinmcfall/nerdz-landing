"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "nerdz-theme";

// The theme is <html data-theme>, which the inline no-flash script in
// layout.tsx sets before first paint (from localStorage, falling back to
// the system preference). The server can't know it, so hydration renders
// the server's "dark" and React switches to the real theme straight after.
// Rendering the saved theme during hydration instead made the icon differ
// from the server's, and React's recovery re-rendered the whole document,
// dropping the data-theme the script had set.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const currentTheme = (): Theme => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
const serverTheme = (): Theme => "dark";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverTheme);

  // Changing the attribute re-renders this through the observer.
  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode or storage full — toggle still works for the session */
    }
  };

  const isLight = theme === "light";
  const label = `Switch to ${isLight ? "dark" : "light"} mode`;

  return (
    <button
      type="button"
      className="palette-toggle"
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      {isLight ? (
        // moon
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          />
        </svg>
      ) : (
        // sun
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
            <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
          </g>
        </svg>
      )}
    </button>
  );
}
