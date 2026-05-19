import { ReactNode } from "react";
import { SectionHead } from "./SectionHead";
import { parseRSS, formatRSSDate } from "@/lib/rss";

type Row = { date: string; title: string; tag?: string; href?: string };

const PLACEHOLDER_POSTS: Row[] = [
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

const BLOG_BASE = "https://blog.nerdz.cloud";
const RSS_URL = `${BLOG_BASE}/index.xml`;
const BLOG_REVALIDATE_SECONDS = 60 * 60; // 1 hour

async function fetchLatestPosts(): Promise<Row[]> {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: BLOG_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return PLACEHOLDER_POSTS;
    const xml = await res.text();
    const items = parseRSS(xml, 3);
    if (items.length === 0) return PLACEHOLDER_POSTS;
    return items.map((item) => ({
      date: formatRSSDate(item.pubDate),
      title: item.title,
      tag: "essay",
      href: item.link,
    }));
  } catch {
    return PLACEHOLDER_POSTS;
  }
}

function Ledger({
  title,
  more,
  moreHref,
  rows,
  kind,
}: {
  title: ReactNode;
  more: string;
  moreHref: string;
  rows: Row[];
  kind?: string;
}) {
  return (
    <div className="ledger">
      <div className="ledger__head">
        <h3 className="ledger__title">{title}</h3>
        <a
          href={moreHref}
          target={moreHref.startsWith("http") ? "_blank" : undefined}
          rel={moreHref.startsWith("http") ? "noreferrer noopener" : undefined}
          className="ledger__more"
        >
          {more} <span aria-hidden="true">→</span>
        </a>
      </div>
      {rows.map((r, i) => (
        <a
          key={i}
          href={r.href ?? "#"}
          target={r.href ? "_blank" : undefined}
          rel={r.href ? "noreferrer noopener" : undefined}
          className="ledger__row"
        >
          <span className="ledger__row-meta">{r.date}</span>
          <span className="ledger__row-title">{r.title}</span>
          <span className="ledger__row-cat">{r.tag ?? kind}</span>
        </a>
      ))}
    </div>
  );
}

export async function Ramblings() {
  const posts = await fetchLatestPosts();

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
            moreHref={BLOG_BASE}
            rows={posts}
          />
          <Ledger
            title={
              <>
                The <em>field manual</em>
              </>
            }
            more="All cheatsheets"
            moreHref="https://docs.nerdz.cloud"
            rows={SHEETS}
            kind="sheet"
          />
        </div>
      </div>
    </section>
  );
}
