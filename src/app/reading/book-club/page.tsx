import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { BookClub } from "@/components/reading/BookClub";

// Server-rendered per request (same OpenNext constraint as the guide
// pages); all real data arrives client-side from /api/bookclub.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Book Club — nerdz.cloud",
  description:
    "Gavin & Kelsie's two-person book club — this month's book, the archive, and the mood-match quiz that picks the next one.",
};

export default function BookClubPage() {
  return (
    <section className="section" id="book-club" aria-label="The Book Club">
      <div className="frame">
        <SectionHead
          title={
            <>
              The Book <em>club</em>
            </>
          }
          caption={<>one book a month · two readers · zero skipped epilogues</>}
        />
        <BookClub />
      </div>
    </section>
  );
}
