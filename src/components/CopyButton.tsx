"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in non-secure contexts; silently no-op.
    }
  };

  return (
    <button
      type="button"
      className="copy-btn"
      onClick={onClick}
      data-copied={copied}
      aria-label={copied ? "Copied" : "Copy code to clipboard"}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
