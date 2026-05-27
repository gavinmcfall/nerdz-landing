import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="hero" aria-label="Intro">
      <div className="frame hero__inner">
        <div className="hero__title-row">
          <div className="hero__titleblock">
            <p className="hero__name-mark">
              Gavin McFall · Auckland · NZ
            </p>
            <h1 className="hero__title">
              <span className="l1">I build tools</span>
              <span className="l2">
                for the <em>nerdy</em> hobbies
              </span>
              <span className="l2">I love.</span>
            </h1>
            <p className="hero__deck">
              Self-hostable software for Star Citizen orgs, 3D printers,
              lore &amp; worldbuilders, and the homelab they all run on.
              All of it open or <em>fair source</em>. Operated by people
              who like operating things themselves — the way you probably
              do.
            </p>
            <div className="hero__ctas">
              <Link href="/projects" className="btn-primary">
                <span>See what I&apos;m building</span>
                <span className="arr" aria-hidden="true">
                  →
                </span>
              </Link>
              <a href="#ramblings" className="btn-ghost mono">
                ramblings →
              </a>
            </div>
          </div>

          <div className="hero__logobox">
            <span className="hero__ring hero__ring--gold" aria-hidden="true" />
            <span className="hero__ring hero__ring--outer" aria-hidden="true" />
            <span className="hero__ring" aria-hidden="true" />
            <Image
              src="/nerdz-logo.svg"
              alt="nerdz"
              width={460}
              height={460}
              className="hero__logo"
              priority
            />
            <span className="hero__live">
              <span className="pulse-dot" aria-hidden="true" />
              <span>cluster online</span>
            </span>
          </div>
        </div>

        <div className="hero__strip">
          <div className="hero__strip-cell">
            <span className="hero__strip-k">role</span>
            <span className="hero__strip-v">
              Tech&nbsp;Lead · <em>serial nerd</em>
            </span>
          </div>
          <div className="hero__strip-cell">
            <span className="hero__strip-k">based</span>
            <span className="hero__strip-v">
              Auckland · <em>NZST</em>
            </span>
          </div>
          <div className="hero__strip-cell">
            <span className="hero__strip-k">building</span>
            <span className="hero__strip-v">
              SC Bridge · Loot Goblin · Realmstack
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
