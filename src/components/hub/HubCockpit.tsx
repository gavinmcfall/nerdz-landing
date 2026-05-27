import Link from "next/link";
import { type ManualCard, groupByCategory } from "./types";

// Direction C — cockpit / dashboard, in the DARK velvet palette lifted from
// nerdz-landing (the real hub) so the field-manuals site is thematically one
// family with it. Warm off-white text (#f1e8d6) on near-black velvet —
// cohesive + far easier on the eyes than the bright paper screen.
// The paper palette now lives only in the printed PDF (the artifact).
export function HubCockpit({ manuals }: { manuals: ManualCard[] }) {
  const cats = groupByCategory(manuals);
  const latest = manuals
    .map((m) => m.updated)
    .sort()
    .slice(-1)[0];
  return (
    <div className="ck">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ck-inner">
        <div className="ck-readout">
          <span className="ck-readout__brand">
            nerdz <span className="ck-arrow">▸</span> field manuals
          </span>
          <span className="ck-readout__stat">
            <span className="ck-dot" /> {manuals.length} manual
            {manuals.length === 1 ? "" : "s"} · updated {latest}
          </span>
        </div>

        <h1 className="ck-title">
          THE FIELD MANUAL <span className="ck-slash">//</span>{" "}
          <span className="ck-sub">printable refs</span>
        </h1>

        {cats.map(([cat, items]) => (
          <section key={cat} className="ck-sec">
            <h2 className="ck-sec__label">{cat}</h2>
            {items.map((m) => (
              <Link key={m.slug} href={`/manuals/${m.slug}`} className="ck-row">
                <span className="ck-dot ck-dot--row" />
                <span className="ck-row__title">{m.title}</span>
                <span className="ck-row__desc">{m.summary}</span>
                <span className="ck-row__type">{m.type}</span>
                <span className="ck-row__paper">{m.paper}</span>
                <span className="ck-row__pdf">⇲ pdf</span>
              </Link>
            ))}
          </section>
        ))}

        <nav className="ck-nav">
          <a href="https://nerdz.cloud">nerdz.cloud</a>
          <a href="https://blog.nerdz.cloud">blog</a>
          <span className="ck-nav__here">guides</span>
        </nav>
      </div>
    </div>
  );
}

const CSS = `
.ck {
  /* consume the global SHELL tokens (set in globals.css) so the cockpit
     stays in sync with the bench AND responds to the high-contrast toggle */
  --bg:var(--shell); --bg-deep:var(--shell-deep); --surface:var(--shell-soft); --card:var(--shell-card);
  --ink:var(--shell-ink); --ink-mid:var(--shell-ink-mid); --ink-mute:var(--shell-ink-mute); --ink-dim:var(--shell-ink-dim);
  --pp:var(--shell-purple-fill); --glow:var(--shell-glow); --gd:var(--shell-gold);
  --rule:var(--shell-rule); --rule-strong:var(--shell-rule-strong);
  --hover:rgba(168,85,247,.10);
  min-height:100vh; background:var(--bg); color:var(--ink);
  background-image:radial-gradient(120% 55% at 50% -10%, rgba(124,58,237,.18), transparent 62%);
}
.ck-inner { max-width:1040px; margin:0 auto; padding:28px 28px 80px; }
.ck-readout { display:flex; justify-content:space-between; align-items:center; padding:11px 16px; border:1px solid var(--rule-strong); border-radius:10px; background:rgba(21,16,31,.6); font-family:var(--font-jetbrains-mono),monospace; font-size:12px; }
.ck-readout__brand { font-weight:600; letter-spacing:.04em; color:var(--ink); }
.ck-arrow { color:var(--glow); }
.ck-readout__stat { display:flex; align-items:center; gap:8px; color:var(--ink-mute); letter-spacing:.06em; }
.ck-dot { width:7px; height:7px; border-radius:50%; background:#3fb950; box-shadow:0 0 8px rgba(63,185,80,.7); display:inline-block; }
.ck-title { font-family:var(--font-jetbrains-mono),monospace; font-weight:700; font-size:clamp(26px,4vw,42px); letter-spacing:.02em; margin:44px 0 32px; line-height:1.05; color:var(--ink); }
.ck-slash { color:var(--gd); }
.ck-sub { color:var(--ink-mute); font-weight:400; font-size:.5em; letter-spacing:.12em; text-transform:uppercase; }
.ck-sec { margin:0 0 10px; }
.ck-sec__label { display:flex; align-items:center; gap:12px; font-family:var(--font-jetbrains-mono),monospace; font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:var(--gd); margin:24px 0 4px; }
.ck-sec__label::after { content:""; flex:1; height:1px; background:var(--rule); }
.ck-row { display:grid; grid-template-columns:auto 1.6fr 1fr auto auto auto; align-items:center; gap:14px; padding:13px 14px; border:1px solid transparent; border-bottom:1px solid var(--rule); text-decoration:none; color:var(--ink); font-family:var(--font-jetbrains-mono),monospace; border-radius:8px; transition:background .15s,border-color .15s; }
.ck-row:hover { background:var(--hover); border-color:var(--rule-strong); }
.ck-dot--row { background:var(--glow); box-shadow:0 0 8px rgba(168,85,247,.6); }
.ck-row__title { font-family:var(--font-plex-sans),sans-serif; font-weight:600; font-size:16px; color:var(--ink); min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ck-row__desc { color:var(--ink-mute); font-size:12.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ck-row__type { font-size:10px; text-transform:uppercase; letter-spacing:.12em; color:#fff; background:var(--pp); padding:3px 9px; border-radius:4px; box-shadow:0 0 12px rgba(106,13,173,.5); }
.ck-row__paper { font-size:10px; letter-spacing:.1em; color:var(--ink-dim); }
.ck-row__pdf { font-size:11px; color:var(--ink-dim); }
.ck-row:hover .ck-row__pdf { color:var(--glow); }
.ck-nav { display:flex; gap:10px; margin-top:32px; }
.ck-nav a,.ck-nav__here { font-family:var(--font-jetbrains-mono),monospace; font-size:12px; padding:7px 15px; border:1px solid var(--rule-strong); border-radius:6px; text-decoration:none; color:var(--ink-mute); }
.ck-nav a:hover { border-color:var(--glow); color:var(--glow); }
.ck-nav__here { background:var(--pp); color:#fff; border-color:var(--pp); }
@media (max-width:760px){ .ck-row{ grid-template-columns:auto 1fr auto; } .ck-row__desc,.ck-row__paper{ display:none; } }
`;
