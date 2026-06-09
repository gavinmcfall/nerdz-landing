import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";

export const metadata: Metadata = {
  title: "BBQ — nerdz.cloud",
  description:
    "Low & slow, in Auckland. Oklahoma Joe Bronco, BBQVANA team, NZ Barbeque Alliance, and the mates who got me hooked.",
};

export default function BBQPage() {
  return (
    <section className="section" id="bbq" aria-label="BBQ">
      <div className="frame">
        <SectionHead
          title={
            <>
              Low &amp; <em>slow</em>
            </>
          }
          caption={<>auckland · drum smoker · BBQVANA</>}
        />

        <div className="about__body">
          <div className="about__intro">
            <p className="about__lede">
              BBQ is not a season &mdash; it&rsquo;s a posture. I cook on a
              drum, judge for fun, and compete with a team called{" "}
              <em>BBQVANA</em>. This page is the kit, the people, and how I
              got hooked.
            </p>
            <img
              className="about__photo"
              src="/lab/bbq/hero.jpg"
              alt="Gavin in a No Sleep 'Til Brisket tee"
              width={512}
              height={416}
              loading="eager"
            />
          </div>

          <div className="about__grid">
            <div className="about__col">
              <h3 className="about__h">How I got into it</h3>
              <p className="about__p">
                Years of <em>judging</em> before I ever lit my own fire
                &mdash; sitting on the scoring side teaches you what good
                actually tastes like. Then my mate{" "}
                <strong>Karl</strong> let me run his Kettle one afternoon. I
                was hooked. Now I cook for my family, my mates, and
                whichever comp is on next.
              </p>

              <h3 className="about__h">My kit</h3>
              <ul className="about__list">
                <li>
                  <strong>Oklahoma Joe Bronco</strong> &mdash; daily-driver
                  drum smoker. Big charcoal basket, steady temps, forgiving
                  about long cooks.
                </li>
                <li>
                  <strong>Weber Go Anywhere &times; 2</strong> &mdash; same
                  shape, one gas one charcoal. The pair I throw in the car.
                </li>
              </ul>

              <h3 className="about__h">Comps</h3>
              <ul className="about__list">
                <li>
                  <strong>Meatstock 2025</strong> &mdash; competed with
                  BBQVANA
                </li>
                <li>
                  <strong>King of the Mountain 2025</strong> &mdash; with
                  the team
                </li>
                <li>More on the schedule &mdash; ask me what&rsquo;s next.</li>
              </ul>
            </div>

            <div className="about__col">
              <h3 className="about__h">The team &mdash; BBQVANA</h3>
              <p className="about__p">
                A crew I&rsquo;m proud to cook with. Find us on the comp
                circuit and on socials.
              </p>
              <ul className="about__list">
                <li>
                  <a
                    href="https://www.instagram.com/bbqvana/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    instagram.com/bbqvana
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/BBQV4NA"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    facebook.com/BBQV4NA
                  </a>
                </li>
              </ul>

              <h3 className="about__h">Affiliations</h3>
              <p className="about__p">
                Member of the <strong>NZ Barbeque Alliance</strong> &mdash;
                the community keeping the craft honest down here.
              </p>
              <ul className="about__list">
                <li>
                  <a
                    href="https://www.facebook.com/NZBarbecue"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    facebook.com/NZBarbecue
                  </a>
                </li>
              </ul>

              <h3 className="about__h">Friends in the scene</h3>
              <p className="about__p">
                <strong>Locally Sauced BBQ</strong> down in Hawkes Bay
                &mdash; good people, good cooks.
              </p>
              <ul className="about__list">
                <li>
                  <a
                    href="https://www.instagram.com/locallysaucedbbq/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    instagram.com/locallysaucedbbq
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/locallysaucedbbq"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    facebook.com/locallysaucedbbq
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
