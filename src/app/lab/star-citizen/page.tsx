import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";

export const metadata: Metadata = {
  title: "Star Citizen — nerdz.cloud",
  description:
    "Calder Rhys / @NZVengeance — Exelus Corporation Executor, Wing Commander concierge, Auckland. Org, character, fleet.",
};

type Ship = {
  name: string;
  callsign?: string;
  role: string;
  note?: string;
};

const FEATURED_FLEET: Ship[] = [
  {
    name: "Aegis Idris-P",
    callsign: "James Holden",
    role: "Capital · Combat",
    note: "The frigate. Org-level firepower. Expanse callsign because of course.",
  },
  {
    name: "RSI Polaris",
    role: "Capital · Combat",
    note: "Corvette. Smaller crew than the Idris, still hits like one.",
  },
  {
    name: "Anvil Carrack Expedition",
    callsign: "Jean-Luc",
    role: "Large · Exploration",
    note: "Long-range exploration flagship. Make it so.",
  },
  {
    name: "Anvil F8C Lightning",
    role: "Small · Combat",
    note: "Top-tier military fighter. The one you take when it really matters.",
  },
  {
    name: "Argo MOLE",
    role: "Medium · Industrial",
    note: "Crew mining. Group play, slow money, satisfying loop.",
  },
  {
    name: "RSI Galaxy",
    role: "Large · Generalist",
    note: "Modular do-everything. The cluster's flexible workhorse.",
  },
];

export default function StarCitizenPage() {
  return (
    <section className="section" id="star-citizen" aria-label="Star Citizen">
      <div className="frame">
        <SectionHead
          title={
            <>
              In the <em>&lsquo;verse</em>
            </>
          }
          caption={
            <>exelus executor · @NZVengeance · auckland</>
          }
        />

        <div className="about__body">
          <div className="about__intro">
            <p className="about__lede">
              I&rsquo;ve been backing <em>Star Citizen</em> since January 2016
              &mdash; in-game year 2946. I fly as{" "}
              <strong>Calder Rhys</strong>{" "}
              (handle <em>@NZVengeance</em>), an{" "}
              <strong>Executor</strong> in{" "}
              <a
                href="https://robertsspaceindustries.com/en/orgs/EXLS"
                target="_blank"
                rel="noreferrer noopener"
              >
                The Exelus Corporation
              </a>{" "}
              &mdash; the senior officer rank, where day-to-day
              operations actually get organised.
            </p>
            <img
              className="about__photo"
              src="/lab/star-citizen/hero.png"
              alt="Calder Rhys — character portrait"
              width={512}
              height={416}
              loading="eager"
            />
          </div>

          <div className="about__grid">
            <div className="about__col">
              <h3 className="about__h">The org &mdash; Exelus</h3>
              <p className="about__p">
                Exelus is a <strong>law-abiding corporation</strong>{" "}
                whose contractors take whatever work the client needs to
                get the job done. Freelancing and social-focused, with
                33 members at last count. RP-leaning. Real-world,
                we&rsquo;ve been a group since <em>1996</em> &mdash; older
                than half the games we play.
              </p>
              <blockquote className="about__quote">
                <p>
                  &ldquo;We are not a guild, we are a family. We do not
                  recruit characters, avatars, toons, or users. We
                  recruit People.&rdquo;
                </p>
                <footer>&mdash; <em>The Exelus manifesto</em></footer>
              </blockquote>

              <h3 className="about__h">Rank ladder</h3>
              <ul className="about__list">
                <li><strong>Prime</strong> &mdash; the leader</li>
                <li><strong>Consul</strong> &mdash; second-in-command</li>
                <li><strong>Executor</strong> &mdash; senior officer <em>(this is me)</em></li>
                <li><strong>Justicar</strong> &mdash; veteran member &amp; mentor</li>
                <li><strong>Warder</strong> &mdash; trusted member</li>
                <li><strong>Attendant</strong> &mdash; new recruit</li>
              </ul>

              <h3 className="about__h">Find us</h3>
              <ul className="about__list">
                <li>
                  <a
                    href="https://robertsspaceindustries.com/en/orgs/EXLS"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    RSI: robertsspaceindustries.com/orgs/EXLS
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/exelus"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    discord.gg/exelus
                  </a>
                </li>
              </ul>
            </div>

            <div className="about__col">
              <h3 className="about__h">The character &mdash; Calder Rhys</h3>
              <ul className="about__list">
                <li><strong>Handle</strong> &mdash; @NZVengeance</li>
                <li><strong>UEE citizen record</strong> &mdash; #1147876</li>
                <li><strong>Main org</strong> &mdash; The Exelus Corporation (Executor)</li>
                <li><strong>Enlisted</strong> &mdash; Jan 4, 2016 &nbsp;<em>(2946)</em></li>
                <li><strong>Location</strong> &mdash; New Zealand, Auckland</li>
                <li><strong>Awards</strong> &mdash; 2953 CDF Gold</li>
              </ul>

              <h3 className="about__h">Backer level</h3>
              <p className="about__p">
                <strong>Wing Commander</strong> concierge &mdash; backed
                deep enough to have a strong opinion about ship
                rebalances. The original tier from 2016 that I&rsquo;ve
                added to over the years.
              </p>

              <h3 className="about__h">What I actually do</h3>
              <ul className="about__list">
                <li>Org ops &mdash; large-ship crew, escort, multi-cap engagements</li>
                <li>Vanduul hunting in <em>Vanduul Swarm</em></li>
                <li>Hauling quantanium one 30k at a time</li>
                <li>Building <a href="https://scbridge.app" target="_blank" rel="noreferrer noopener">SC Bridge</a> on the side &mdash; see below</li>
              </ul>
            </div>
          </div>

          <div className="about__contact">
            <h3 className="about__h">The hangar</h3>
            <p className="about__p">
              <strong>37 ships</strong> on the books. A few that earn the
              most flight time:
            </p>
            <ul className="about__list">
              {FEATURED_FLEET.map((ship) => (
                <li key={ship.name}>
                  <strong>{ship.name}</strong>
                  {ship.callsign ? (
                    <>
                      {" "}<em>&ldquo;{ship.callsign}&rdquo;</em>
                    </>
                  ) : null}
                  {" "}&mdash; {ship.role}. {ship.note}
                </li>
              ))}
            </ul>
            <p className="about__p">
              Full fleet (with real-time sync to RSI) lives on{" "}
              <a
                href="https://scbridge.app/u/NZVengeance/fleet"
                target="_blank"
                rel="noreferrer noopener"
              >
                SC Bridge
              </a>
              .
            </p>
          </div>

          <div className="about__contact">
            <h3 className="about__h">SC Bridge &mdash; the tool I built for this</h3>
            <p className="about__p">
              I built <strong>SC Bridge</strong> because the existing
              fleet trackers either lied about my ships or asked me to
              maintain them by hand. SC Bridge pulls straight from RSI,
              stays in sync, and gives org leaders a real picture of
              what their members can field.
            </p>
            <ul className="about__contact-list">
              <li>
                <a href="https://scbridge.app" target="_blank" rel="noreferrer noopener">
                  scbridge.app
                </a>{" "}
                <span className="about__contact-k">the app</span>
              </li>
              <li>
                <a href="/projects">/projects</a>{" "}
                <span className="about__contact-k">more on the project</span>
              </li>
            </ul>
          </div>

          <div className="about__contact">
            <h3 className="about__h">New to Star Citizen?</h3>
            <p className="about__p">
              If you&rsquo;re thinking about jumping in, use my referral
              code to get a bonus on your first pledge &mdash; and I get
              one too. Fair trade.
            </p>
            <ul className="about__contact-list">
              <li>
                <a
                  href="https://www.robertsspaceindustries.com/enlist?referral=STAR-6WG5-BTYL"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Sign up with referral
                </a>{" "}
                <span className="about__contact-k">STAR-6WG5-BTYL</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
