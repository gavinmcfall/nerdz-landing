import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { PlanBoard } from "@/components/warcraft/PlanBoard";
import { getIndex } from "@/lib/warcraft/data";
import { readPlan } from "@/lib/warcraft/plan";
import { planKv } from "@/lib/warcraft/plan-server";

// The plan and the synced levels both change; read them on each request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forever plan — World of Warcraft — nerdz.cloud",
  description: "Which WoW Forever alt I'm levelling next, their specs and dual specs, and how the professions are spread across them.",
};

export default async function PlanPage() {
  const [plan, index] = await Promise.all([planKv().then(readPlan), getIndex()]);
  const synced = (index?.characters ?? [])
    .filter((c) => c.game === "forever")
    .map(({ game, name, status, level, lastSuccessAt }) => ({ game, name, status, level, lastSuccessAt }));

  return (
    <section className="section" id="warcraft-plan" aria-label="WoW Forever plan">
      <div className="frame">
        <p className="wow-crumb mono">
          <Link href="/lab">lab</Link> / <Link href="/lab/warcraft">warcraft</Link> / plan
        </p>
        <SectionHead
          title={
            <>
              Forever <em>plan</em>
            </>
          }
          caption={<>levelling order · specs · professions</>}
        />
        <p className="wow-intro">
          The Ravenholt alts on WoW Forever: who I&rsquo;m levelling next, the spec each starts with and the dual spec
          it picks up at 40, and how the professions cover each other.
        </p>
        <PlanBoard initialPlan={plan} synced={synced} />
      </div>
    </section>
  );
}
