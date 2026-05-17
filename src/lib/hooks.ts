"use client";

import { useEffect, useState } from "react";

export type NodeBase = {
  name: string;
  role: string;
  baseTemp: number;
  baseLoad: number;
  basePower: number;
};

export type NodeStat = NodeBase & {
  temp: number;
  load: number;
  power: number;
  warm: boolean;
};

export const NODES: NodeBase[] = [
  { name: "stanton-01", role: "control plane · ups", baseTemp: 42, baseLoad: 22, basePower: 28 },
  { name: "stanton-02", role: "control plane", baseTemp: 44, baseLoad: 28, basePower: 26 },
  { name: "stanton-03", role: "control plane", baseTemp: 41, baseLoad: 18, basePower: 24 },
  { name: "pyro-01", role: "worker · gpu · ml", baseTemp: 56, baseLoad: 71, basePower: 180 },
];

function initialStats(): NodeStat[] {
  return NODES.map((n) => ({
    ...n,
    temp: n.baseTemp,
    load: n.baseLoad,
    power: n.basePower,
    warm: n.baseTemp >= 50,
  }));
}

export function useNodeStats(): NodeStat[] {
  const [stats, setStats] = useState<NodeStat[]>(initialStats);

  useEffect(() => {
    let tick = 0;
    const compute = () => {
      tick += 1;
      setStats(
        NODES.map((node, i) => {
          const tDrift =
            Math.sin((tick + i * 1.7) * 0.5) * 4 + (Math.random() - 0.5) * 2;
          const lDrift =
            Math.sin((tick + i * 2.3) * 0.6) * 12 + (Math.random() - 0.5) * 6;
          const temp = Math.round(node.baseTemp + tDrift);
          const load = Math.max(
            4,
            Math.min(96, Math.round(node.baseLoad + lDrift)),
          );
          // Power correlates loosely with load: 70% base at idle, ~130% at full.
          const loadFraction = load / 100;
          const power = Math.round(
            node.basePower * (0.7 + loadFraction * 0.6) +
              (Math.random() - 0.5) * 4,
          );
          return { ...node, temp, load, power, warm: temp >= 50 };
        }),
      );
    };
    const id = setInterval(compute, 2800);
    return () => clearInterval(id);
  }, []);

  return stats;
}

function formatUptime(days: number): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const secs = Math.floor((Date.now() - start.getTime()) / 1000);
  const h = String(Math.floor(secs / 3600) % 24).padStart(2, "0");
  const m = String(Math.floor(secs / 60) % 60).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${days}d ${h}:${m}:${s}`;
}

export function useUptime(days: number): string {
  // Render-stable initial value so server and first client render match.
  const [uptime, setUptime] = useState<string>(`${days}d 00:00:00`);

  useEffect(() => {
    // First update on next macrotask (not in the effect body) so we don't
    // trigger a cascading render synchronously.
    const id = setInterval(() => setUptime(formatUptime(days)), 1000);
    const seed = setTimeout(() => setUptime(formatUptime(days)), 0);
    return () => {
      clearInterval(id);
      clearTimeout(seed);
    };
  }, [days]);

  return uptime;
}
