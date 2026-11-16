import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { RosterCard } from "@/components/warcraft/RosterCard";
import { getIndex } from "@/lib/warcraft/data";
import { formatSynced, sortRetail } from "@/lib/warcraft/format";

// Read from KV on each request: the sync rewrites it nightly.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "World of Warcraft — nerdz.cloud",
  description: "Every World of Warcraft character I play, retail and WoW Forever, synced nightly from Blizzard's API.",
};

export default async function WarcraftPage() {
  const index = await getIndex();
  const characters = index?.characters ?? [];
  const retail = sortRetail(characters.filter((c) => c.game === "retail" && c.status !== "not-listed"));
  const forever = characters.filter((c) => c.game === "forever");
  const foreverListed = forever.filter((c) => c.status !== "not-listed");
  const foreverPending = forever.filter((c) => c.status === "not-listed");
  const realms = [...new Set(retail.map((c) => c.realm).filter(Boolean))];
  const surnames = [...new Set(forever.map((c) => c.surname).filter(Boolean))];
  const synced = formatSynced(index?.updatedAt);

  return (
    <section className="section" id="warcraft" aria-label="World of Warcraft">
      <div className="frame">
        <p className="wow-crumb mono">
          <Link href="/lab">lab</Link> / warcraft
        </p>
        <SectionHead
          title={
            <>
              World of <em>Warcraft</em>
            </>
          }
          caption={<>retail · forever · synced nightly</>}
        />
        <p className="wow-intro">
          Every character I play, pulled from Blizzard&rsquo;s API each night. Horde on retail, Alliance on WoW
          Forever. Pick one to see its gear, specs and the rest, laid out like the Armory.
        </p>

        {characters.length === 0 ? (
          <p className="wow-empty">No characters synced yet.</p>
        ) : (
          <>
            {retail.length > 0 && (
              <>
                <div className="wow-group">
                  <h3 className="wow-group__title">Retail</h3>
                  <span className="wow-group__meta">
                    {retail.length} characters · {realms.join(" & ")}
                  </span>
                </div>
                <div className="wow-grid">
                  {retail.map((c) => (
                    <RosterCard key={c.key} summary={c} />
                  ))}
                </div>
              </>
            )}

            {forever.length > 0 && (
              <>
                <div className="wow-group">
                  <h3 className="wow-group__title">WoW Forever</h3>
                  <span className="wow-group__meta">
                    {forever.length} characters{surnames.length > 0 && ` · ${surnames.join(" & ")}`}
                  </span>
                </div>
                <div className="wow-grid">
                  {[...foreverListed, ...foreverPending].map((c) => (
                    <RosterCard key={c.key} summary={c} />
                  ))}
                </div>
              </>
            )}

            {synced && <p className="wow-foot mono">updated {synced} · data from the battle.net api</p>}
          </>
        )}
      </div>
    </section>
  );
}
