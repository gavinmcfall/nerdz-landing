import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuthEnv } from "@/lib/auth/env";
import { readSession } from "@/lib/auth/session";
import { EDITORS_KEY, type EditorsDoc } from "./plan";

// Server-only plumbing for the Forever plan: the KV binding and whether the
// caller may edit. The editor list holds opaque OAuth uids, which never
// leave this module.

export const NO_STORE = { "Cache-Control": "no-store" };

export type PlanKv = CloudflareEnv["WOW_ARMORY"];

export async function planKv(): Promise<PlanKv | null> {
  try {
    return (await getCloudflareContext({ async: true })).env.WOW_ARMORY ?? null;
  } catch {
    return null;
  }
}

export type PlanAccess = { kv: PlanKv | null; signedIn: boolean; editor: boolean };

export async function planAccess(req: Request): Promise<PlanAccess> {
  const kv = await planKv();
  let uid: string | null = null;
  try {
    const env = await getAuthEnv();
    uid = (await readSession(req, env.AUTH_SECRET))?.uid ?? null;
  } catch {
    // Auth not configured (dev without secrets): signed out.
  }
  if (!uid || !kv) return { kv, signedIn: Boolean(uid), editor: false };
  const doc = (await kv.get(EDITORS_KEY, "json")) as EditorsDoc | null;
  return { kv, signedIn: true, editor: Boolean(doc?.editors?.some((e) => e.uid === uid)) };
}
