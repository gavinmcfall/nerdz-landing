import { ReactNode } from "react";
import { SectionHead } from "./SectionHead";
import projectStatsData from "@/lib/project-stats.data.json";

// Derived from repo state at build time (per Gavin's rule, 2026-05-29):
//   spec   — docs only, no code yet
//   design — code exists, no qualifying releases
//   alpha  — non-prerelease release whose tag contains "alpha"
//   beta   — non-prerelease release whose tag contains "beta"
//   live   — non-prerelease release with semver-style tag
//   stale  — no commits in >= 6 months (overrides everything else)
// Fallback when a project has no repo (truly planned): hand-typed
// `fallbackStatus`.
type DerivedStatus = "spec" | "design" | "alpha" | "beta" | "live" | "stale";

type Project = {
  n: string;
  name: string;
  handle: string;
  motto: string;
  desc: string;
  tags: string[];
  /** GitHub repo. Status, build, commits, lastPush all derive from this. */
  repo?: { owner: string; name: string };
  /** Used when `repo` is absent (no codebase to introspect yet). */
  fallbackStatus?: DerivedStatus;
  /** Override the auto-fetched "build" label (e.g. internal rc number). */
  buildOverride?: string;
  stack: ReactNode;
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
    repo: { owner: "SC-Bridge", name: "sc-bridge" },
    stack: (
      <span>
        next · ts · <em>pg</em>
      </span>
    ),
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
    repo: { owner: "gavinmcfall", name: "lootgoblin" },
    stack: (
      <span>
        rust · <em>sqlite</em>
      </span>
    ),
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
    repo: { owner: "Realmstacks", name: "Realmstack" },
    stack: <span>sveltekit · pg</span>,
    side: "left",
  },
  {
    n: "04",
    name: "Postcraft",
    handle: "postcraft",
    motto: "Mail for AI, on infrastructure you own.",
    desc: "One MCP server for every mailbox. Outlook, Gmail, Migadu, iCloud, Fastmail, any IMAP. Read, send, label from Claude. BYO identity, self-hosted.",
    tags: ["MCP", "Email", "Self-host"],
    repo: { owner: "gavinmcfall", name: "postcraft" },
    stack: <span>ts · imap</span>,
    side: "right",
  },
  {
    n: "05",
    name: "Spyglass",
    handle: "spyglass",
    motto: "Fleet view for your Claude Code sessions.",
    desc: "A self-hosted fleet view of every Claude Code session you've started.",
    tags: ["Self-host", "Claude Code", "Fleet"],
    repo: { owner: "gavinmcfall", name: "spyglass" },
    stack: <span>go</span>,
    side: "left",
  },
  {
    n: "06",
    name: "Mangarr",
    handle: "mangarr",
    motto: "The *arr-tier that didn't exist for manga.",
    desc: "Watches what your downloader grabbed, asks AniList what kind of comic it is, and quietly files each series into the right Kavita library so the reading direction is correct without you doing anything.",
    tags: ["Manga", "Kavita", "AniList", "Self-host", "Arr"],
    repo: { owner: "gavinmcfall", name: "mangarr" },
    stack: <span>go · anilist</span>,
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
  status?: DerivedStatus;
  reachedTier?: DerivedStatus;
  error?: string;
};
const STATS = (projectStatsData as { stats: Record<string, ProjectStatsEntry> })
  .stats;

// Each tier's position on the spec→ship bar. Stale wraps whatever tier the
// repo reached before going quiet, so the bar still reads that progress.
const TIER_PROGRESS: Record<DerivedStatus, number> = {
  spec: 10,
  design: 30,
  alpha: 55,
  beta: 80,
  live: 100,
  stale: 0, // overridden by reachedTier; see resolveProgress()
};

function resolveStatus(p: Project): {
  status: DerivedStatus;
  reachedTier: DerivedStatus;
} {
  const entry = p.repo ? STATS[`${p.repo.owner}/${p.repo.name}`] : undefined;
  if (entry?.status) {
    return {
      status: entry.status,
      reachedTier: entry.reachedTier ?? entry.status,
    };
  }
  // No repo or no data (fail-open): hand-typed fallback, or "spec" baseline.
  const fb = p.fallbackStatus ?? "spec";
  return { status: fb, reachedTier: fb };
}

function resolveProgress(status: DerivedStatus, reachedTier: DerivedStatus): number {
  return TIER_PROGRESS[status === "stale" ? reachedTier : status];
}

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
  const { status, reachedTier } = resolveStatus(p);
  const progress = resolveProgress(status, reachedTier);
  return (
    <div className="statwin">
      <div className="statwin__head">
        <span className="statwin__head-l">{`// ${p.handle}.spec`}</span>
        <span className={`statwin__head-r stat--${status}`}>
          <span className="stat-dot" aria-hidden="true" />
          {status}
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
          <span>{status}</span>
        </div>
        <div
          className={`statwin__bar-fill statwin__bar-fill--${status}`}
          style={{ ["--prog" as string]: `${progress}%` }}
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
