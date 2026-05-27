import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";

export const metadata: Metadata = {
  title: "About — nerdz.cloud",
  description: "Who Gavin McFall is and why nerdz.cloud exists.",
};

// STUB — placeholder copy for Gavin to replace.
export default function AboutPage() {
  return (
    <section className="section" id="about" aria-label="About">
      <div className="frame">
        <SectionHead
          num="—"
          title="About"
          caption="Who, what, and why — in progress."
        />
        <div className="about__body">
          <p>
            <em>Placeholder.</em> Gavin McFall — tech lead, serial nerd,
            Auckland. I build self-hostable tools for the hobbies I love and run
            them on a homelab I look after myself.
          </p>
          <p>
            This page is a stub. Replace it with the real story: what
            nerdz.cloud is, why fair-source, the projects, the cluster, and how
            to get in touch.
          </p>
        </div>
      </div>
    </section>
  );
}
