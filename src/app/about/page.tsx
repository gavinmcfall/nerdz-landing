import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";

export const metadata: Metadata = {
  title: "About — nerdz.cloud",
  description:
    "Gavin McFall — Auckland, deep nerd, self-hoster, builder of tools for niche communities that deserve better software.",
};

// Content adapted from the old blog.nerdz.cloud /about page — voice and
// section structure preserved, formatted to fit the unified shell.
export default function AboutPage() {
  return (
    <section className="section" id="about" aria-label="About">
      <div className="frame">
        <SectionHead
          title={
            <>
              About <em>nerdz</em>
            </>
          }
          caption={
            <>auckland · self-host · build for the hobbies you love</>
          }
        />

        <div className="about__body">
          <p className="about__lede">
            Hey, I&rsquo;m Gavin&nbsp;👋. I run nerdz.cloud and most of
            what&rsquo;s on the cluster above. I have a deep interest in
            all things <em>nerdy</em>, and I build self-hostable tools for
            the niche communities I&rsquo;m in &mdash; because the tools
            they deserve usually don&rsquo;t exist yet.
          </p>

          <div className="about__grid">
            <div className="about__col">
              <h3 className="about__h">Kubernetes</h3>
              <ul className="about__list">
                <li>Self-hosting services for fun and learning</li>
                <li>Highly-available control planes &amp; storage</li>
                <li>Talos OS as a Kubernetes-native operating system</li>
              </ul>

              <h3 className="about__h">Networking</h3>
              <ul className="about__list">
                <li>Ubiquiti gear from the shelf up</li>
                <li>VPNs: WireGuard, Tailscale, OpenVPN</li>
                <li>Hardening, VLANs, segmenting the IoT zoo</li>
              </ul>

              <h3 className="about__h">Home automation</h3>
              <ul className="about__list">
                <li>Apple HomeKit</li>
                <li>Home Assistant</li>
                <li>Matter, Thread, Zigbee, MQTT, BLE</li>
              </ul>
            </div>

            <div className="about__col">
              <h3 className="about__h">Operating systems</h3>
              <ul className="about__list">
                <li>Linux: Ubuntu, Debian, Talos, SteamOS</li>
                <li>Windows</li>
                <li>macOS</li>
              </ul>

              <h3 className="about__h">Other rabbit holes</h3>
              <ul className="about__list">
                <li>Cars (motorsport, EVs)</li>
                <li>Neurodiversity</li>
                <li>Gaming (PC, Steam Deck, TTRPG, TCG, MMO orgs)</li>
                <li>3D printing &amp; STL hoarding</li>
                <li>Star Citizen orgs &amp; fleet management</li>
              </ul>

              <h3 className="about__h">How I learn</h3>
              <p className="about__p">
                Hands dirty, in production, on the cluster downstairs.
                Hobby projects shipped end-to-end are how the
                interesting questions surface.
              </p>
              <blockquote className="about__quote">
                <p>
                  &ldquo;Tell me and I forget, teach me and I may remember,
                  involve me and I learn.&rdquo;
                </p>
                <footer>
                  &mdash; <em>Benjamin Franklin</em>
                </footer>
              </blockquote>
            </div>
          </div>

          <div className="about__contact">
            <h3 className="about__h">Get in touch</h3>
            <ul className="about__contact-list">
              <li>
                <a href="mailto:gavin@nerdz.co.nz">gavin@nerdz.co.nz</a>{" "}
                <span className="about__contact-k">letters</span>
              </li>
              <li>
                <a
                  href="https://github.com/gavinmcfall"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  github.com/gavinmcfall
                </a>{" "}
                <span className="about__contact-k">code</span>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/gavinmcfall/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  linkedin.com/in/gavinmcfall
                </a>{" "}
                <span className="about__contact-k">work history</span>
              </li>
              <li>
                <a
                  href="https://github.com/gavinmcfall/home-ops"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  home-ops monorepo
                </a>{" "}
                <span className="about__contact-k">the cluster, as code</span>
              </li>
              <li>
                <a
                  href="https://discord.gg/Exelus"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  discord.gg/Exelus
                </a>{" "}
                <span className="about__contact-k">star citizen org</span>
              </li>
              <li>
                <a
                  href="https://makerworld.com/en/@nzvengeance"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  makerworld.com/@nzvengeance
                </a>{" "}
                <span className="about__contact-k">3d prints</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
