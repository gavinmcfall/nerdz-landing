"use client";

import { useState } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "nerdz-theme";

// Reads <html data-theme>, which the inline no-flash script in layout.tsx
// sets BEFORE first paint (from localStorage, falling back to the user's
// system preference). Initialising state from that means the right icon
// renders on the first client paint, matching the actual theme.
function initialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
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
      // server renders one icon, client may render the other if the user has
      // a saved light preference — suppress that one-element diff
      suppressHydrationWarning
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
