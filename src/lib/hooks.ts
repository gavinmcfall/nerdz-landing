"use client";

import { useEffect, useState } from "react";

export type NodeStat = {
  name: string;
  role: string;
  temp: number;
  load: number;
  power: number;
  warm: boolean;
  healthy: boolean;
};

export type ClusterSummary = {
  healthy: number;
  total: number;
  avgTemp: number;
  uptimeSeconds: number;
  /** Total running pods across the cluster (kromgo: cluster_pod_count). */
  podCount: number | null;
  /** Flux GitOps state (kromgo: flux_kustomizations_ready / _total). */
  fluxReady: number | null;
  fluxTotal: number | null;
  /** WAN speedtest most recent download throughput (kromgo: speedtest_download_mbps). */
  speedtestDownMbps: number | null;
};

export type ClusterSnapshot = {
  nodes: NodeStat[];
  summary: ClusterSummary;
  isLive: boolean;
  loaded: boolean;
};

// Static fallback used for SSR + initial paint + when /api/cluster is
// unreachable. Names match the real cluster so the page reads correctly
// even without live data.
const FALLBACK_NODES: NodeStat[] = [
  { name: "stanton-01", role: "control plane · ups", temp: 42, load: 22, power: 28, warm: false, healthy: true },
  { name: "stanton-02", role: "control plane",       temp: 44, load: 28, power: 26, warm: false, healthy: true },
  { name: "stanton-03", role: "control plane",       temp: 41, load: 18, power: 24, warm: false, healthy: true },
];

const FALLBACK_SUMMARY: ClusterSummary = {
  healthy: 3,
  total: 3,
  avgTemp: 42,
  // 0 until live data lands — useUptimeFromSnapshot renders an em-dash
  // placeholder when uptimeSeconds is 0 so we don't show a fictional value.
  uptimeSeconds: 0,
  podCount: null,
  fluxReady: null,
  fluxTotal: null,
  speedtestDownMbps: null,
};

const FALLBACK: ClusterSnapshot = {
  nodes: FALLBACK_NODES,
  summary: FALLBACK_SUMMARY,
  isLive: false,
  loaded: false,
};

type ApiResponse = {
  summary: ClusterSummary;
  nodes: Omit<NodeStat, "warm">[];
  timestamp: string;
};

const POLL_MS = 6_000;

async function fetchSnapshot(signal: AbortSignal): Promise<ClusterSnapshot | null> {
  try {
    const res = await fetch("/api/cluster", { signal, cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as ApiResponse;
    const nodes: NodeStat[] = data.nodes.map((n) => ({
      ...n,
      warm: n.temp >= 50,
    }));
    return {
      nodes,
      summary: data.summary,
      isLive: true,
      loaded: true,
    };
  } catch {
    return null;
  }
}

export function useClusterSnapshot(): ClusterSnapshot {
  const [snap, setSnap] = useState<ClusterSnapshot>(FALLBACK);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      const next = await fetchSnapshot(controller.signal);
      if (cancelled) return;
      if (next) setSnap(next);
      else setSnap((prev) => ({ ...prev, loaded: true })); // mark loaded even on failure
      timer = setTimeout(tick, POLL_MS);
    };

    // First fetch fires on next macrotask so we don't set state synchronously
    // in the effect body (React 19 strict purity rule).
    const seed = setTimeout(tick, 0);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(seed);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return snap;
}

export function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const days = Math.floor(seconds / 86400);
  const rest = Math.floor(seconds) - days * 86400;
  const h = String(Math.floor(rest / 3600) % 24).padStart(2, "0");
  const m = String(Math.floor(rest / 60) % 60).padStart(2, "0");
  const s = String(Math.floor(rest) % 60).padStart(2, "0");
  return `${days}d ${h}:${m}:${s}`;
}

// Ticks every second and returns a formatted uptime string. While the
// snapshot is still seeding (uptimeSeconds == 0) it renders an em-dash
// placeholder rather than a fictional value.
export function useUptimeFromSnapshot(snap: ClusterSnapshot): string {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  void tick;
  return formatUptime(snap.summary.uptimeSeconds + tick);
}
