"use client";

import { useUptime } from "@/lib/hooks";

export function UptimeText({ days = 47 }: { days?: number }) {
  const uptime = useUptime(days);
  return <>{uptime}</>;
}
