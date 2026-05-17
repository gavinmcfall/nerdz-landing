"use client";

import { useClusterSnapshot } from "@/lib/hooks";

// Renders the small "cluster <ok|warn|down>" indicator used in the topbar.
// `ok` when every node reports healthy; `warn` when at least one is missing
// but some are still up; `down` when nothing is responding.
export function ClusterStatusBadge() {
  const snap = useClusterSnapshot();
  const { healthy, total } = snap.summary;

  let status: "ok" | "warn" | "down" | "…";
  if (!snap.loaded) status = "…";
  else if (healthy === total && total > 0) status = "ok";
  else if (healthy === 0) status = "down";
  else status = "warn";

  return (
    <>
      cluster <span className="gold">{status}</span>
    </>
  );
}
