import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterHeader } from "@/components/warcraft/CharacterHeader";
import { ComingSoon, TabBar } from "@/components/warcraft/TabBar";
import { getIndex } from "@/lib/warcraft/data";
import { resolveCharacterPath } from "@/lib/warcraft/resolve";
import type { Summary } from "@/lib/warcraft/types";

// Read from KV on each request: the sync rewrites it nightly.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ path: string[] }> };

// The character for this address, or null. Characters the API doesn't list
// yet have no page: the roster shows them without a link.
async function findCharacter(path: string[]) {
  const index = await getIndex();
  if (!index) return null;
  const match = resolveCharacterPath(index.characters, path);
  if (!match) return null;
  const summary = index.characters[match.index];
  if (summary.status === "not-listed" || !summary.lastSuccessAt) return null;
  return { summary, tab: match.tab };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await findCharacter((await params).path);
  if (!found) return { title: "Not found" };
  const { summary } = found;
  const full = [summary.name, summary.surname].filter(Boolean).join(" ");
  return {
    title: `${full} — World of Warcraft — nerdz.cloud`,
    description: [summary.level, summary.race, summary.spec, summary.characterClass].filter(Boolean).join(" "),
  };
}

function Crumb({ summary }: { summary: Summary }) {
  const where = summary.game === "retail" ? summary.realm : summary.ruleset;
  return (
    <p className="wow-crumb mono">
      <Link href="/lab">lab</Link> / <Link href="/lab/warcraft">warcraft</Link> / {summary.game}
      {where && ` / ${where}`}
    </p>
  );
}

export default async function CharacterPage({ params }: Params) {
  const found = await findCharacter((await params).path);
  if (!found) notFound();
  const { summary, tab } = found;

  return (
    <section className="section wow-character" aria-label={summary.name}>
      <div className="frame">
        <Crumb summary={summary} />
        <CharacterHeader summary={summary} />
        <TabBar route={summary.route} active={tab} />
        {tab === "character" ? <p className="wow-soon">Character tab coming in the next commit.</p> : <ComingSoon tab={tab} />}
      </div>
    </section>
  );
}
