import Link from "next/link";
import { blogLink } from "@/lib/flags";

// The shared shell footer. Markup follows the contract in
// docs/unified-shell-spec.md §2 (class names mirrored by the Hugo blog).
// Internal index links use <Link> (renders a plain <a>) for SPA navigation.
export function Colophon() {
  return (
    <footer className="shell-colophon" aria-label="Colophon">
      <div className="frame">
        <div className="shell-colophon__grid">
          <div>
            <h4>The pitch</h4>
            <p className="shell-colophon__pitch">
              If you self-host, like things <em>done right</em>, and your
              gaming guild is named after a potato — we should probably
              talk.
            </p>
            <div className="shell-colophon__btn-row">
              <a href="mailto:gavin@nerdz.co.nz" className="btn-primary">
                <span>Letters</span>
                <span className="arr" aria-hidden="true">
                  →
                </span>
              </a>
              <a
                href="https://github.com/gavinmcfall"
                className="btn-ghost mono"
                target="_blank"
                rel="noreferrer noopener"
              >
                github
              </a>
            </div>
          </div>

          <div>
            <h4>Elsewhere</h4>
            <ul className="shell-colophon__list">
              <li>
                <a
                  href="https://github.com/gavinmcfall"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  GitHub <span className="arr">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/Exelus"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Star Citizen org · discord.gg/Exelus{" "}
                  <span className="arr">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://makerworld.com/en/@nzvengeance"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  MakerWorld <span className="arr">↗</span>
                </a>
              </li>
              <li>
                <a href="/blog/index.xml">
                  RSS <span className="arr">→</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Index</h4>
            <ul className="shell-colophon__list">
              <li>
                <Link href="/projects">
                  Projects <span className="arr">→</span>
                </Link>
              </li>
              <li>
                <Link href="/lab">
                  The Lab <span className="arr">→</span>
                </Link>
              </li>
              <li>
                <Link href="/manuals">
                  Field Manuals <span className="arr">→</span>
                </Link>
              </li>
              <li>
                {blogLink.external ? (
                  <a
                    href={blogLink.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Blog <span className="arr">↗</span>
                  </a>
                ) : (
                  <Link href={blogLink.href}>
                    Blog <span className="arr">→</span>
                  </Link>
                )}
              </li>
              <li>
                <Link href="/about">
                  About <span className="arr">→</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Colophon</h4>
            <p className="shell-colophon__credit">
              Set in <em>IBM Plex Sans</em> &amp; <em>JetBrains Mono</em>.
              Composed in Auckland. Hosted on the cluster above. For the
              guilds we&apos;ve named <em>kwisatz taterach</em>,{" "}
              <em>Frycarus</em>, and <em>Pirates of the Carbohydrates</em>{" "}
              — you know who you are.
            </p>
          </div>
        </div>

        <div className="shell-imprint">
          <div className="shell-imprint__brand">
            <span className="shell-imprint__dot" aria-hidden="true" />
            <span>nerdz.cloud</span>
          </div>
          <div className="shell-imprint__center">
            © <span className="gold">MMXXVI</span> Gavin McFall · cc by-nc-sa
            4.0
          </div>
          <div className="shell-imprint__right">
            if you&apos;ve read this far · you might be the right kind of nerd
          </div>
        </div>
      </div>
    </footer>
  );
}
