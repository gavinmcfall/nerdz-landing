// gen-project-stats.mjs — fetches build-time stats for every repo referenced
// by src/components/Workshop.tsx and writes them to
// src/lib/project-stats.data.json. The Workshop server component imports
// that file, merges with its static metadata, and renders. Same shape as
// scripts/gen-manuals.mjs.
//
// Reads GH_STATS_TOKEN from the env (Actions secret in CI, .env.local in
// dev). Token needs `repo` scope so it can see private repos under any org
// (gavinmcfall/*, SC-Bridge/*, Realmstacks/*). Falls back to empty/null
// values if the token is missing — the page still renders, just with dashes.
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = `${__dirname}/../src/lib/project-stats.data.json`;

// The single source of truth for which repos to pull. Workshop.tsx's repo
// fields must match these (key = "owner/name"). Keep this list and the
// PROJECTS array in src/components/Workshop.tsx in sync.
const REPOS = [
  { owner: "SC-Bridge", name: "sc-bridge" },
  { owner: "gavinmcfall", name: "lootgoblin" },
  { owner: "Realmstacks", name: "Realmstack" },
  { owner: "gavinmcfall", name: "postcraft" },
  { owner: "gavinmcfall", name: "spyglass" },
  { owner: "gavinmcfall", name: "mangarr" },
];

const QUERY = `
  query ($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      pushedAt
      isPrivate
      primaryLanguage { name }
      latestRelease { tagName }
      releases(first: 20, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes { tagName isPrerelease createdAt }
      }
      defaultBranchRef {
        target {
          ... on Commit {
            history { totalCount }
          }
        }
      }
    }
  }
`;

// Derive status per Gavin's rule (2026-05-29):
//   spec   — repo has docs only, no code yet (primaryLanguage null / Markdown)
//   design — code exists, no qualifying releases
//   alpha  — has a non-prerelease release whose tag contains "alpha"
//   beta   — has a non-prerelease release whose tag contains "beta"
//   live   — has a non-prerelease release with a clean semver-style tag
//   stale  — overrides everything else: no commits in >= 6 months
// "Most advanced" wins for the release tier: live > beta > alpha. Stale wraps
// the bar regardless of which tier it reached.
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;
function deriveStatus(repo, now = Date.now()) {
  if (!repo) return { status: "spec", reachedTier: "spec" };

  const lang = repo.primaryLanguage?.name ?? null;
  const hasCode = lang != null && lang !== "Markdown";

  const releases = (repo.releases?.nodes ?? []).filter((r) => !r.isPrerelease);
  const tags = releases.map((r) => (r.tagName || "").toLowerCase());
  const hasAlpha = tags.some((t) => t.includes("alpha"));
  const hasBeta = tags.some((t) => t.includes("beta"));
  // "real release" = non-prerelease, version-like, not alpha/beta/rc.
  const hasLive = tags.some(
    (t) => /^v?\d/.test(t) && !/alpha|beta|rc|pre/.test(t),
  );

  let reachedTier;
  if (hasLive) reachedTier = "live";
  else if (hasBeta) reachedTier = "beta";
  else if (hasAlpha) reachedTier = "alpha";
  else if (hasCode) reachedTier = "design";
  else reachedTier = "spec";

  const pushedTs = Date.parse(repo.pushedAt);
  const isStale =
    !Number.isNaN(pushedTs) && now - pushedTs >= SIX_MONTHS_MS;

  return { status: isStale ? "stale" : reachedTier, reachedTier };
}

function humanLastPush(iso) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1mo ago";
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1yr ago" : `${years}yr ago`;
}

async function fetchRepo(token, repo) {
  if (!token) {
    return { repo, ok: false, reason: "no-token" };
  }
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "nerdz-landing-build/1.0",
      },
      body: JSON.stringify({ query: QUERY, variables: repo }),
    });
    if (!res.ok) {
      return { repo, ok: false, reason: `http-${res.status}` };
    }
    const json = await res.json();
    const r = json?.data?.repository;
    if (!r) {
      return { repo, ok: false, reason: "no-data", errors: json?.errors };
    }
    const { status, reachedTier } = deriveStatus(r);
    return {
      repo,
      ok: true,
      pushedAt: r.pushedAt,
      lastPushHuman: humanLastPush(r.pushedAt),
      commits: r.defaultBranchRef?.target?.history?.totalCount ?? null,
      release: r.latestRelease?.tagName ?? null,
      isPrivate: r.isPrivate,
      status,
      reachedTier,
    };
  } catch (err) {
    return { repo, ok: false, reason: "fetch-error", err: String(err) };
  }
}

const token = process.env.GH_STATS_TOKEN;
if (!token) {
  console.warn(
    "gen-project-stats: GH_STATS_TOKEN not set — writing an empty stats file. " +
      "Workshop will render with — for every dynamic stat. " +
      "Set GH_STATS_TOKEN in .env.local (dev) or Actions secrets (CI) to fix.",
  );
}

const results = await Promise.all(REPOS.map((r) => fetchRepo(token, r)));

const data = {};
for (const r of results) {
  const key = `${r.repo.owner}/${r.repo.name}`;
  if (!r.ok) {
    data[key] = { error: r.reason };
    console.warn(`  ${key}: ${r.reason}`);
    continue;
  }
  data[key] = {
    pushedAt: r.pushedAt,
    lastPushHuman: r.lastPushHuman,
    commits: r.commits,
    release: r.release,
    isPrivate: r.isPrivate,
    status: r.status,
    reachedTier: r.reachedTier,
  };
  console.log(
    `  ${key}: ${r.status} (reached ${r.reachedTier}) · ${r.commits ?? "?"} commits · pushed ${r.lastPushHuman ?? "?"} · ${r.release ?? "no-release"}${r.isPrivate ? " · private" : ""}`,
  );
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      stats: data,
    },
    null,
    2,
  ) + "\n",
);
console.log(`gen-project-stats: wrote ${OUT}`);
