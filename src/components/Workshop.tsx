import { ReactNode } from "react";
import { SectionHead } from "./SectionHead";

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
  stats: { k: string; v: ReactNode }[];
  progress: number;
  progressLabel: string;
  side: "left" | "right";
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
    stats: [
      { k: "build", v: "v0.4-rc1" },
      { k: "commits", v: "412" },
      { k: "last push", v: "2d ago" },
      {
        k: "stack",
        v: (
          <span>
            next · ts · <em>pg</em>
          </span>
        ),
      },
    ],
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
    stats: [
      { k: "build", v: "v0.2" },
      { k: "commits", v: "138" },
      { k: "last push", v: "6d ago" },
      {
        k: "stack",
        v: (
          <span>
            rust · <em>sqlite</em>
          </span>
        ),
      },
    ],
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
    stats: [
      { k: "build", v: "alpha 3" },
      { k: "commits", v: "89" },
      { k: "last push", v: "11d ago" },
      { k: "stack", v: <span>sveltekit · pg</span> },
    ],
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
    status: "planned",
    statusClass: "planned",
    stats: [
      { k: "build", v: <em>tbd</em> },
      { k: "commits", v: "—" },
      { k: "last push", v: "—" },
      { k: "stack", v: <span>go · imap</span> },
    ],
    progress: 8,
    progressLabel: "spec",
    side: "right",
  },
];

function Statwin({ p }: { p: Project }) {
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
        {p.stats.map((s, i) => (
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
          caption={<>four projects · in the order they keep me up</>}
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
