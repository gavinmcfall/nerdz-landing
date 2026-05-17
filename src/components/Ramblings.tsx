import { ReactNode } from "react";
import { SectionHead } from "./SectionHead";

type Row = { date: string; title: string; tag?: string };

const POSTS: Row[] = [
  {
    date: "2026 · 04 · 22",
    title: "Notes on shipping fewer, weirder things",
    tag: "essay",
  },
  {
    date: "2026 · 03 · 31",
    title: "Why “self-hostable” is a feature, not an ideology",
    tag: "essay",
  },
  {
    date: "2026 · 02 · 18",
    title: "Designing for the homelab — taste, not chrome",
    tag: "design",
  },
];

const SHEETS: Row[] = [
  {
    date: "kube",
    title: "A k3s cluster you can rebuild from a single yaml",
  },
  {
    date: "tailscale",
    title: "Tailnet patterns for mixed home + cloud workloads",
  },
  {
    date: "bambu",
    title: "Klipper macros that survive a firmware update",
  },
];

function Ledger({
  title,
  more,
  rows,
  kind,
}: {
  title: ReactNode;
  more: string;
  rows: Row[];
  kind?: string;
}) {
  return (
    <div className="ledger">
      <div className="ledger__head">
        <h3 className="ledger__title">{title}</h3>
        <a href="#" className="ledger__more">
          {more} <span aria-hidden="true">→</span>
        </a>
      </div>
      {rows.map((r, i) => (
        <a key={i} href="#" className="ledger__row">
          <span className="ledger__row-meta">{r.date}</span>
          <span className="ledger__row-title">{r.title}</span>
          <span className="ledger__row-cat">{r.tag ?? kind}</span>
        </a>
      ))}
    </div>
  );
}

export function Ramblings() {
  return (
    <section className="section" id="ramblings" aria-label="Ramblings">
      <div className="frame">
        <SectionHead
          num="03"
          title={
            <>
              Of <em>ramblings</em> &amp; field manuals
            </>
          }
          caption={<>occasional · always evolving</>}
        />
        <div className="ledger-row">
          <Ledger
            title={
              <>
                Of <em>ramblings</em>
              </>
            }
            more="The full register"
            rows={POSTS}
          />
          <Ledger
            title={
              <>
                The <em>field manual</em>
              </>
            }
            more="All cheatsheets"
            rows={SHEETS}
            kind="sheet"
          />
        </div>
      </div>
    </section>
  );
}
