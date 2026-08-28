import { z } from "zod";
import type { ReadingGuide } from "./reading";

// Shared shapes for the reading-progress sync API. The stored record is the
// same versioned shape the client keeps in localStorage, plus updatedAt.

export const PROGRESS_VERSION = 1;

/** Hard cap on request bodies — 145 ids is ~2KB; 16KB leaves headroom. */
export const MAX_PROGRESS_BODY_BYTES = 16 * 1024;

export const ProgressBodySchema = z.object({
  v: z.literal(PROGRESS_VERSION),
  checked: z.array(z.string().max(64)).max(2000),
});

export type ProgressRecord = {
  v: typeof PROGRESS_VERSION;
  checked: string[];
  updatedAt: string;
};

export function emptyProgress(): ProgressRecord {
  return { v: PROGRESS_VERSION, checked: [], updatedAt: "" };
}

/** Drop ids the guide doesn't know (stale clients, tampering) and dedupe. */
export function sanitizeChecked(guide: ReadingGuide, checked: string[]): string[] {
  const valid = new Set(guide.items.map((i) => i.id));
  return [...new Set(checked)].filter((id) => valid.has(id));
}

export function progressKey(uid: string, slug: string): string {
  return `progress:${uid}:${slug}`;
}
