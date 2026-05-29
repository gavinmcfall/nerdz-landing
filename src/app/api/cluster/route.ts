import { NextResponse } from "next/server";

// kromgo serves shields.io v1-shaped JSON per metric:
//   { color, label, message, schemaVersion }
// `message` carries the value with an optional unit suffix ("°C", "%", "w", " Mbps").

const KROMGO_BASE = "https://kromgo.nerdz.cloud";

type Shields = {
  color?: string;
  label?: string;
  message?: string;
  schemaVersion?: number;
};

type NodeName = "stanton-01" | "stanton-02" | "stanton-03";

const NODE_META: { name: NodeName; role: string; key: string }[] = [
  { name: "stanton-01", role: "control plane · ups", key: "stanton01" },
  { name: "stanton-02", role: "control plane", key: "stanton02" },
  { name: "stanton-03", role: "control plane", key: "stanton03" },
];

const SUMMARY_QUERIES = [
  "cluster_health_ready",
  "cluster_health_total",
  "cluster_temp_avg",
  "cluster_uptime_seconds",
  // 4th-tile metrics (where pyro-01 used to sit).
  "cluster_pod_count",
  "flux_kustomizations_ready",
  "flux_kustomizations_total",
  "speedtest_download_mbps",
  "nas_capacity_used",
  "nas_capacity_total",
] as const;

async function fetchMetric(name: string): Promise<number | null> {
  try {
    const res = await fetch(`${KROMGO_BASE}/${name}`, {
      next: { revalidate: 5 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data: Shields = await res.json();
    if (!data.message) return null;
    // Strip unit suffixes and any non-numeric trailing characters.
    const numeric = parseFloat(data.message.replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const summaryPromise = Promise.all(SUMMARY_QUERIES.map(fetchMetric));

  const nodePromises = NODE_META.map(async (meta) => {
    const [temp, load, power] = await Promise.all([
      fetchMetric(`node_temp_${meta.key}`),
      fetchMetric(`node_load_${meta.key}`),
      fetchMetric(`node_power_est_${meta.key}`),
    ]);
    return {
      name: meta.name,
      role: meta.role,
      temp: temp ?? 0,
      load: load ?? 0,
      power: power ?? 0,
      // Until /api/cluster surfaces per-node Ready conditions, treat any
      // node that responded with a non-null temp OR power as up.
      healthy: temp !== null || power !== null,
    };
  });

  const [summary, nodes] = await Promise.all([
    summaryPromise,
    Promise.all(nodePromises),
  ]);

  const [
    healthy,
    total,
    avgTemp,
    uptimeSeconds,
    podCount,
    fluxReady,
    fluxTotal,
    speedtestDown,
    nasUsedTib,
    nasTotalTib,
  ] = summary;

  return NextResponse.json(
    {
      summary: {
        healthy: healthy ?? 0,
        total: total ?? NODE_META.length,
        avgTemp: avgTemp ?? 0,
        uptimeSeconds: uptimeSeconds ?? 0,
        podCount: podCount ?? null,
        fluxReady: fluxReady ?? null,
        fluxTotal: fluxTotal ?? null,
        speedtestDownMbps: speedtestDown ?? null,
        nasUsedTib: nasUsedTib ?? null,
        nasTotalTib: nasTotalTib ?? null,
      },
      nodes,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=5, stale-while-revalidate=15",
      },
    },
  );
}
