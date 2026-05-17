"use client";

import {
  useClusterSnapshot,
  useUptimeFromSnapshot,
} from "@/lib/hooks";

export function UptimeText() {
  const snap = useClusterSnapshot();
  const uptime = useUptimeFromSnapshot(snap);
  return <>{uptime}</>;
}
