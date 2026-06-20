// SCREEN-ONLY web view. Section data lives in src/data/blender-addons.json
// (the source of truth, also consumed by scripts/render_pdf.py for the PDF).
// Row/desc/keys HTML is rendered via dangerouslySetInnerHTML (raw `class=` is
// correct for innerHTML); content is script-controlled, not user input.
// Print is a wholly separate surface (a real PDF) — no @page CSS here.
import data from "@/data/blender-addons.json";

type ShortcutRow = { desc: string; keys: string };
type Item =
  | { kind: "band"; num: string; category: string }
  | { kind: "menu"; title: string; rows: ShortcutRow[] }
  | {
      kind: "card";
      name: string;
      sub?: string;
      menuOnly?: boolean;
      what: string;
      when: string;
      shortcuts: ShortcutRow[];
      notes?: string[];
    }
  | { kind: "footer"; text: string };

const ITEMS = data as Item[];

const STYLES = `
.blender-addons {
  background: var(--paper-soft);
  color: var(--ink);
  padding: 20px 24px;
  min-height: 100%;
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}
.blender-addons .ad-head {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 16px; padding-bottom: 10px;
  border-bottom: 1px solid var(--rule-strong);
}
.blender-addons .ad-title {
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-weight: 700; font-size: 28px; letter-spacing: -0.025em;
  margin: 0; color: var(--ink); line-height: 1;
}
.blender-addons .ad-title em { font-style: italic; font-weight: 500; color: var(--purple); }
.blender-addons .ad-tag {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em;
  color: var(--ink-mute);
}
.blender-addons .ad-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 12px; align-items: start;
}
.blender-addons .ad-band {
  grid-column: 1 / -1;
  display: flex; align-items: baseline; justify-content: space-between;
  margin: 10px 0 2px; padding-bottom: 5px;
  border-bottom: 1px solid var(--rule-strong);
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-weight: 600; font-size: 13px; text-transform: uppercase;
  letter-spacing: 0.14em; color: var(--ink-mid);
}
.blender-addons .ad-band:first-of-type { margin-top: 0; }
.blender-addons .ad-band-num {
  font-style: italic; font-weight: 400; font-size: 18px;
  color: var(--gold); letter-spacing: 0; text-transform: none;
}
.blender-addons .ad-card {
  background: var(--paper-card);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  padding: 12px 16px 14px;
  display: flex; flex-direction: column;
}
.blender-addons .ad-menu { grid-column: 1 / -1; }
.blender-addons .ad-name {
  display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-weight: 600; font-size: 15px; letter-spacing: -0.01em;
  margin: 0 0 6px; color: var(--ink); line-height: 1.2;
}
.blender-addons .ad-badge {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--ink-mute);
  border: 1px solid var(--rule-strong); border-radius: 3px;
  padding: 1px 5px; line-height: 1.4;
}
.blender-addons .ad-sub {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 10px; color: var(--ink-mute); margin: -2px 0 6px;
}
.blender-addons .ad-what { margin: 0 0 6px; font-size: 12.5px; color: var(--ink-mid); }
.blender-addons .ad-when {
  margin: 0 0 8px; font-size: 12px; color: var(--ink-mute); line-height: 1.4;
}
.blender-addons .ad-when span {
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--gold); margin-right: 5px;
}
.blender-addons .row {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 10px; padding: 3px 0;
  border-bottom: 1px solid rgba(10, 7, 18, 0.05);
  font-size: 12.5px; line-height: 1.45;
}
.blender-addons .row:last-child { border-bottom: 0; }
.blender-addons .desc { color: var(--ink-mid); flex: 1; min-width: 0; }
.blender-addons .desc b { font-weight: 600; color: var(--ink); }
.blender-addons .keys { text-align: right; white-space: nowrap; }
.blender-addons kbd {
  display: inline-block;
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 11px; font-weight: 600; padding: 1px 6px;
  background: var(--paper-deep); color: var(--ink);
  border: 1px solid var(--rule); border-bottom-width: 2px;
  border-radius: 3px; line-height: 1.4; vertical-align: baseline;
}
.blender-addons kbd.mouse { background: #ece4d0; }
.blender-addons .or {
  color: var(--ink-mute); font-style: italic; font-size: 11px; margin-left: 4px;
}
.blender-addons .note {
  margin-top: 8px; padding-top: 5px;
  border-top: 1px dashed var(--rule);
  font-style: italic; font-size: 11.5px; color: var(--ink-mute); line-height: 1.4;
}
.blender-addons .note strong { font-style: normal; color: var(--ink); font-weight: 600; }
.blender-addons .note kbd { font-style: normal; }
.blender-addons .ad-foot {
  grid-column: 1 / -1;
  margin-top: 16px; padding-top: 10px;
  border-top: 1px solid var(--rule);
  font-style: italic; font-size: 11px; color: var(--ink-mute); line-height: 1.5;
}
@media (max-width: 720px) {
  .blender-addons .ad-grid { grid-template-columns: 1fr; }
}
`;

function Rows({ rows }: { rows: ShortcutRow[] }) {
  return (
    <>
      {rows.map((r, i) => (
        <div className="row" key={i}>
          <span className="desc" dangerouslySetInnerHTML={{ __html: r.desc }} />
          <span className="keys" dangerouslySetInnerHTML={{ __html: r.keys }} />
        </div>
      ))}
    </>
  );
}

export function BlenderAddonsManual() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="blender-addons">
        <header className="ad-head">
          <h1 className="ad-title">
            Blender <em>Addons</em>
          </h1>
          <span className="ad-tag">hard-surface toolkit</span>
        </header>
        <div className="ad-grid">
          {ITEMS.map((it, i) => {
            if (it.kind === "band") {
              return (
                <div className="ad-band" key={i}>
                  <span>{it.category}</span>
                  <span className="ad-band-num">{it.num}</span>
                </div>
              );
            }
            if (it.kind === "menu") {
              return (
                <section className="ad-card ad-menu" key={i}>
                  <h2 className="ad-name">{it.title}</h2>
                  <Rows rows={it.rows} />
                </section>
              );
            }
            if (it.kind === "footer") {
              return (
                <div className="ad-foot" key={i}>
                  {it.text}
                </div>
              );
            }
            return (
              <section className="ad-card" key={i}>
                <h2 className="ad-name">
                  <span>{it.name}</span>
                  {it.menuOnly ? <span className="ad-badge">menu-only</span> : null}
                </h2>
                {it.sub ? <div className="ad-sub">{it.sub}</div> : null}
                <p className="ad-what">{it.what}</p>
                <p className="ad-when">
                  <span>When</span>
                  {it.when}
                </p>
                <Rows rows={it.shortcuts} />
                {it.notes?.map((n, j) => (
                  <div className="note" key={j} dangerouslySetInnerHTML={{ __html: n }} />
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
