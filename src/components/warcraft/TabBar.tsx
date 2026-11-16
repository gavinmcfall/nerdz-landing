import Link from "next/link";
import { TABS, TAB_LABELS, characterHref, type Tab } from "@/lib/warcraft/resolve";

export function TabBar({ route, active }: { route: string[]; active: Tab }) {
  return (
    <nav className="wow-tabs" aria-label="Character sections">
      {TABS.map((tab) => (
        <Link
          key={tab}
          href={characterHref(route, tab)}
          className="wow-tab"
          aria-current={tab === active ? "page" : undefined}
          scroll={false}
        >
          {TAB_LABELS[tab]}
        </Link>
      ))}
    </nav>
  );
}

export function ComingSoon({ tab }: { tab: Tab }) {
  return (
    <div className="wow-soon">
      <p>{TAB_LABELS[tab]} is coming soon.</p>
    </div>
  );
}
