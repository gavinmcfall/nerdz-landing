"use client";

import { useEffect, useState } from "react";

type Contrast = "default" | "high";
type Font = "default" | "dyslexic";

const STORAGE_KEY_CONTRAST = "nerdz-docs-contrast";
const STORAGE_KEY_FONT = "nerdz-docs-font";

export function AccessibilityMenu() {
  const [contrast, setContrast] = useState<Contrast>("default");
  const [font, setFont] = useState<Font>("default");
  const [mounted, setMounted] = useState(false);

  // Load persisted prefs after mount to avoid SSR hydration mismatch.
  // Deferred into a timer so setState happens in a callback context
  // (React 19 strict purity disallows sync setState in the effect body).
  useEffect(() => {
    const id = setTimeout(() => {
      const c = localStorage.getItem(STORAGE_KEY_CONTRAST) as Contrast | null;
      const f = localStorage.getItem(STORAGE_KEY_FONT) as Font | null;
      if (c === "high") setContrast("high");
      if (f === "dyslexic") setFont("dyslexic");
      setMounted(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // Sync state → <html> dataset + localStorage.
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.contrast = contrast;
    localStorage.setItem(STORAGE_KEY_CONTRAST, contrast);
  }, [contrast, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.font = font;
    localStorage.setItem(STORAGE_KEY_FONT, font);
  }, [font, mounted]);

  // Avoid rendering the menu until mounted (prevents flash of unstyled).
  if (!mounted) return null;

  return (
    <div className="a11y-menu no-print" role="group" aria-label="Accessibility">
      <div className="a11y-menu__row">
        <span className="a11y-menu__label">font</span>
        <button
          type="button"
          className="a11y-menu__btn"
          data-active={font === "default"}
          onClick={() => setFont("default")}
        >
          aA
        </button>
        <button
          type="button"
          className="a11y-menu__btn"
          data-active={font === "dyslexic"}
          onClick={() => setFont("dyslexic")}
          title="OpenDyslexic"
        >
          dys
        </button>
      </div>
      <div className="a11y-menu__row">
        <span className="a11y-menu__label">contrast</span>
        <button
          type="button"
          className="a11y-menu__btn"
          data-active={contrast === "default"}
          onClick={() => setContrast("default")}
        >
          std
        </button>
        <button
          type="button"
          className="a11y-menu__btn"
          data-active={contrast === "high"}
          onClick={() => setContrast("high")}
        >
          high
        </button>
      </div>
    </div>
  );
}
