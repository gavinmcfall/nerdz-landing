import { ReactNode } from "react";
import { SectionHead } from "./SectionHead";
import projectStatsData from "@/lib/project-stats.data.json";

type ProjectStatus = "in dev" | "alpha" | "planned" | "ok";

type Project = {
  n: string;
  name: string;
  handle: string;
  motto: string;
  desc: string;
  tags: string[];
  status: ProjectStatus;
  statusClass: string;
  /** GitHub repo, used to look up build/commits/lastPush at build time. */
  repo?: { owner: string; name: string };
  /** Override the auto-fetched "build" label (e.g. internal rc number). */
  buildOverride?: string;
  stack: ReactNode;
  progress: number;
  progressLabel: string;
  side: "left" | "right";
  /** Public link for the "Visit" CTA — leave undefined for "Coming soon". */
  url?: string;
};

const PROJECTS: Project[] = [
  {
    n: "01",
    name: "SC Bridge",
    handle: "sc-bridge",
    motto: "Your hangar, your fleet, your loot — without the spreadsheet.",
    desc: "Fleet management & game data tools Star Citizen players deserve. Ships, insurance, loot, missions, AI fleet recommendations — pulled out of the game and into something you can actually fly and loot.",
    tags: ["Star Citizen", "Fleet", "AI"],
    status: "in dev",
    statusClass: "in-dev",
    repo: { owner: "SC-Bridge", name: "sc-bridge" },
    stack: (
      <span>
        next · ts · <em>pg</em>
      </span>
    ),
    progress: 62,
    progressLabel: "beta",
    side: "left",
    url: "https://scbridge.app/",
  },
  {
    n: "02",
    name: "Loot Goblin",
    handle: "loot-goblin",
    motto: "Hoarding and organizing the internets STLs.",
    desc: "Model library + print workflow makers deserve. Scrape MakerWorld / Cults3D / Thingiverse, manage filament, dispatch to Bambu / Klipper / OctoPrint. Self-hosted so your collection is yours.",
    tags: ["3D Print", "Workflow", "Self-host"],
    status: "in dev",
    statusClass: "in-dev",
    repo: { owner: "gavinmcfall", name: "lootgoblin" },
    stack: (
      <span>
        rust · <em>sqlite</em>
      </span>
    ),
    progress: 38,
    progressLabel: "alpha",
    side: "right",
    url: "https://github.com/gavinmcfall/lootgoblin",
  },
  {
    n: "03",
    name: "Realmstack",
    handle: "realmstack",
    motto: "Lore tools that disappear behind your imagination.",
    desc: "Lore tools writers, DMs, and worldbuilders deserve. Characters, factions, places, maps — linked, searchable, real-time collab. Neurodivergent-friendly. Fair Source.",
    tags: ["Lore", "Worldbuilding", "TTRPG", "Self-Host", "SaaS", "Fair Source"],
    status: "alpha",
    statusClass: "alpha",
    repo: { owner: "Realmstacks", name: "Realmstack" },
    stack: <span>sveltekit · pg</span>,
    progress: 22,
    progressLabel: "alpha",
    side: "left",
  },
  {
    n: "04",
    name: "Postcraft",
    handle: "postcraft",
    motto: "Mail for AI, on infrastructure you own.",
    desc: "One MCP server for every mailbox. Outlook, Gmail, Migadu, iCloud, Fastmail, any IMAP. Read, send, label from Claude. BYO identity, self-hosted.",
    tags: ["MCP", "Email", "Self-host"],
    status: "in dev",
    statusClass: "in-dev",
    repo: { owner: "gavinmcfall", name: "postcraft" },
    stack: <span>ts · imap</span>,
    progress: 30,
    progressLabel: "alpha",
    side: "right",
  },
  {
    n: "05",
    name: "Spyglass",
    handle: "spyglass",
    motto: "Fleet view for your Claude Code sessions.",
    desc: "A self-hosted fleet view of every Claude Code session you've started.",
    tags: ["Self-host", "Claude Code", "Fleet"],
    status: "in dev",
    statusClass: "in-dev",
    repo: { owner: "gavinmcfall", name: "spyglass" },
    stack: <span>go</span>,
    progress: 10,
    progressLabel: "alpha",
    side: "left",
  },
  {
    n: "06",
    name: "Mangarr",
    handle: "mangarr",
    motto: "The *arr-tier that didn't exist for manga.",
    desc: "Watches what your downloader grabbed, asks AniList what kind of comic it is, and quietly files each series into the right Kavita library so the reading direction is correct without you doing anything.",
    tags: ["Manga", "Kavita", "AniList", "Self-host", "Arr"],
    status: "in dev",
    statusClass: "in-dev",
    repo: { owner: "gavinmcfall", name: "mangarr" },
    stack: <span>go · anilist</span>,
    progress: 15,
    progressLabel: "alpha",
    side: "right",
    url: "https://github.com/gavinmcfall/mangarr",
  },
];

type ProjectStatsEntry = {
  pushedAt?: string;
  lastPushHuman?: string;
  commits?: number | null;
  release?: string | null;
  isPrivate?: boolean;
  error?: string;
};
const STATS = (projectStatsData as { stats: Record<string, ProjectStatsEntry> })
  .stats;

function statsForProject(p: Project): { k: string; v: ReactNode }[] {
  const entry = p.repo ? STATS[`${p.repo.owner}/${p.repo.name}`] : undefined;
  const dash = "—";
  const build =
    p.buildOverride ??
    entry?.release ??
    (entry && !entry.error ? "no release" : dash);
  const commits = entry?.commits != null ? entry.commits.toLocaleString() : dash;
  const lastPush = entry?.lastPushHuman ?? dash;
  return [
    { k: "build", v: build },
    { k: "commits", v: commits },
    { k: "last push", v: lastPush },
    { k: "stack", v: p.stack },
  ];
}

function Statwin({ p }: { p: Project }) {
  const stats = statsForProject(p);
  return (
    <div className="statwin">
      <div className="statwin__head">
        <span className="statwin__head-l">{`// ${p.handle}.spec`}</span>
        <span className={`statwin__head-r stat--${p.statusClass}`}>
          <span className="stat-dot" aria-hidden="true" />
          {p.status}
        </span>
      </div>
      <h4 className="statwin__title">{p.name} — status window</h4>
      <div className="statwin__grid">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="statwin__stat-k">{s.k}</div>
            <div className="statwin__stat-v">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="statwin__bar">
        <div className="statwin__bar-row">
          <span>spec → ship</span>
          <span>
            {p.progressLabel} · {p.progress}%
          </span>
        </div>
        <div
          className="statwin__bar-fill"
          style={{ ["--prog" as string]: `${p.progress}%` }}
        />
      </div>
    </div>
  );
}

function Feature({ p }: { p: Project }) {
  return (
    <article className={`feature ${p.side === "right" ? "feature--right" : ""}`}>
      <div className="feature__inner">
        <div className="feature__body">
          <div className="feature__head">
            <span className="feature__handle">
              <span className="num">№ {p.n}</span>/{p.handle}
            </span>
          </div>
          <h3 className="feature__name">{p.name}</h3>
          <p className="feature__motto">&ldquo;{p.motto}&rdquo;</p>
          <p className="feature__desc">{p.desc}</p>
          <div className="feature__tags">
            {p.tags.map((t) => (
              <span key={t} className="feature__tag">
                {t}
              </span>
            ))}
          </div>
          <a
            href={p.url ?? "#"}
            target={p.url ? "_blank" : undefined}
            rel={p.url ? "noreferrer noopener" : undefined}
            className="feature__cta"
            aria-disabled={p.url ? undefined : true}
          >
            <span>{p.url ? "Visit" : "Coming soon"}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="feature__media">
          <Statwin p={p} />
        </div>
      </div>
    </article>
  );
}

export function Workshop() {
  return (
    <section className="section" id="projects" aria-label="The workshop">
      <div className="frame">
        <SectionHead
          num="01"
          title={
            <>
              The <em>workshop</em>
            </>
          }
          caption={
            <>
              {PROJECTS.length} projects · in the order they keep me up
            </>
          }
        />
      </div>
      <div className="features">
        {PROJECTS.map((p) => (
          <Feature key={p.n} p={p} />
        ))}
      </div>
    </section>
  );
}
