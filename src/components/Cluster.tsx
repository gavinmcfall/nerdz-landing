"use client";

import { useNodeStats } from "@/lib/hooks";
import { SectionHead } from "./SectionHead";
import { UptimeText } from "./UptimeText";

export function Cluster() {
  const stats = useNodeStats();
  // Simulator: every node is "up". Real telemetry pass will set a healthy
  // flag from kubectl's Ready condition. `warm` is a temp-elevated cue and
  // does NOT mean unhealthy — a GPU node running hot is still green.
  const healthy = stats.length;
  const avgTemp = Math.round(
    stats.reduce((a, n) => a + n.temp, 0) / stats.length,
  );

  return (
    <section className="section" id="cluster" aria-label="The homelab">
      <div className="frame">
        <SectionHead
          num="04"
          title={
            <>
              The <em>homelab</em>
            </>
          }
          caption={<>four nodes · talos · live telemetry coming</>}
        />
        <div className="cluster">
          <div className="cluster__lede">
            <h3 className="cluster__h">
              Where all of this <em>actually runs.</em>
            </h3>
            <p className="cluster__p">
              A four-node Talos OS Kubernetes cluster on a shelf in
              Auckland — three Stanton control planes and a Pyro GPU
              worker. (Named after Star Citizen systems, because of
              course.) Temps and load below are placeholder until the
              kromgo telemetry wire-up lands.
            </p>
          </div>

          <div>
            <div className="cluster__grid">
              {stats.map((n) => (
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
                    {n.temp}
                    <span className="deg">°C</span>
                  </div>
                  <div className="node__meta">
                    <span>load</span>
                    <span>{n.load}%</span>
                  </div>
                  <div
                    className="node__bar"
                    style={{ ["--load" as string]: `${n.load}%` }}
                  />
                  <div className="node__meta">
                    <span>power</span>
                    <span>{n.power} W</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="cluster__sub">
              <div className="cluster__stat">
                <div className="cluster__stat-k">health</div>
                <div className="cluster__stat-v">
                  {healthy === stats.length ? (
                    <em>all green</em>
                  ) : (
                    <>
                      {healthy}/{stats.length} green
                    </>
                  )}
                </div>
              </div>
              <div className="cluster__stat">
                <div className="cluster__stat-k">avg temp</div>
                <div className="cluster__stat-v">
                  {avgTemp}
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
