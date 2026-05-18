// Minimal RSS 2.0 reader, scoped to what the Ramblings section needs:
// the title, link, and pubDate of the most recent N items. The Hugo feed
// at blog.nerdz.cloud/index.xml has a stable schema and includes full
// post HTML in <description>, which we deliberately ignore to keep the
// response we hand back tiny.

export type RSSItem = {
  title: string;
  link: string;
  pubDate: Date;
};

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeEntities(s: string): string {
  return s.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (m) => HTML_ENTITIES[m]);
}

function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1");
}

function tagContent(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const m = block.match(re);
  if (!m) return null;
  return decodeEntities(stripCdata(m[1].trim()));
}

export function parseRSS(xml: string, limit = 3): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;

  while ((m = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = m[1];
    const title = tagContent(block, "title");
    const link = tagContent(block, "link");
    const pubDateStr = tagContent(block, "pubDate");
    if (!title || !link || !pubDateStr) continue;
    const pubDate = new Date(pubDateStr);
    if (Number.isNaN(pubDate.getTime())) continue;
    items.push({ title, link, pubDate });
  }

  return items;
}

export function formatRSSDate(d: Date): string {
  const y = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y} · ${month} · ${day}`;
}
