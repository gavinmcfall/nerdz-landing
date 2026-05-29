"use client";

import type { ReactNode } from "react";
import { useClusterSnapshot } from "@/lib/hooks";
import { SectionHead } from "./SectionHead";
import { UptimeText } from "./UptimeText";

export function Cluster() {
  const snap = useClusterSnapshot();
  const { nodes, summary, isLive, loaded } = snap;
  const {
    healthy,
    total,
    avgTemp,
    podCount,
    fluxReady,
    fluxTotal,
    cpuPct,
    memPct,
    speedtestDownMbps,
    nasUsedTib,
    nasTotalTib,
  } = summary;

  const nasRow =
    nasUsedTib != null && nasTotalTib != null
      ? `${Math.round(nasUsedTib)}/${Math.round(nasTotalTib)} TiB`
      : "—";

  const pair = (k: string, v: ReactNode) => (
    <span className="cluster__topbar__pair">
      <span className="cluster__topbar__k">{k}</span>
      <span className="cluster__topbar__v">{v}</span>
    </span>
  );

  const caption = !loaded
    ? "three nodes · talos · connecting…"
    : isLive
      ? "three nodes · talos · live telemetry"
      : "three nodes · talos · live telemetry coming";

  return (
    <section className="section" id="cluster" aria-label="The homelab">
      <div className="frame">
        <SectionHead
          title={
            <>
              The <em>homelab</em>
            </>
          }
          caption={<>{caption}</>}
        />
        <div className="cluster">
          <div className="cluster__lede">
            <h3 className="cluster__h">
              Where all of this <em>actually runs.</em>
            </h3>
            <p className="cluster__p">
              A three-node Talos OS Kubernetes cluster on a shelf in
              Auckland — Stanton-01 through 03, named after the Star
              Citizen system, because of course. Numbers below are
              live from the kromgo bridge, polled every few seconds.
            </p>
          </div>

          <div>
            <div className="cluster__grid">
              {nodes.map((n) => (
                <div
                  key={n.name}
                  className={`node ${n.warm ? "warm" : ""}`}
                >
                  <div className="node__name">
                    <span>{n.name}</span>
                    <span className="pulse-dot" aria-hidden="true" />
                  </div>
                  <div className="node__role">{n.role}</div>
                  <div className="node__temp">
                    {Math.round(n.temp)}
                    <span className="deg">°C</span>
                  </div>
                  <div className="node__meta">
                    <span>load</span>
                    <span>{Math.round(n.load)}%</span>
                  </div>
                  <div
                    className="node__bar"
                    style={{ ["--load" as string]: `${Math.round(n.load)}%` }}
                  />
                  <div className="node__meta">
                    <span>power</span>
                    <span>{Math.round(n.power)} W</span>
                  </div>
                </div>
              ))}
              {/* Cluster-wide stats bar fused to the base of the node grid.
                   Single row, three groups via justify-content: space-between
                   — pods/flux LEFT, cpu/mem CENTER, wan/nas RIGHT. Each pair
                   (k+v) is tight; pair-to-pair gap is looser. No hairline
                   separators. */}
              <div className="cluster__topbar">
                <div className="cluster__topbar__group">
                  {pair("pods", podCount != null ? podCount : "—")}
                  {pair(
                    "flux",
                    fluxReady != null && fluxTotal != null
                      ? `${fluxReady}/${fluxTotal}`
                      : "—",
                  )}
                </div>
                <div className="cluster__topbar__group">
                  {pair(
                    "cpu",
                    cpuPct != null ? `${Math.round(cpuPct)}%` : "—",
                  )}
                  {pair(
                    "mem",
                    memPct != null ? `${Math.round(memPct)}%` : "—",
                  )}
                </div>
                <div className="cluster__topbar__group">
                  {pair(
                    "wan ↓",
                    speedtestDownMbps != null
                      ? `${Math.round(speedtestDownMbps)} Mbps`
                      : "—",
                  )}
                  {pair("nas", nasRow)}
                </div>
              </div>
            </div>
            <div className="cluster__sub">
              <div className="cluster__stat">
                <div className="cluster__stat-k">health</div>
                <div className="cluster__stat-v">
                  {healthy === total && total > 0 ? (
                    <em>all green</em>
                  ) : (
                    <>
                      {healthy}/{total} green
                    </>
                  )}
                </div>
              </div>
              <div className="cluster__stat">
                <div className="cluster__stat-k">avg temp</div>
                <div className="cluster__stat-v">
                  {Math.round(avgTemp)}
                  <span className="gold italic">°C</span>
                </div>
              </div>
              <div className="cluster__stat">
                <div className="cluster__stat-k">uptime</div>
                <div className="cluster__stat-v">
                  <UptimeText />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
