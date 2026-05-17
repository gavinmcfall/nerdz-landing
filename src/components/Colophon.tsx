export function Colophon() {
  return (
    <footer className="colophon" aria-label="Colophon">
      <div className="frame">
        <div className="colophon__grid">
          <div>
            <h4>The pitch</h4>
            <p className="colophon__pitch">
              If you self-host, like things <em>done right</em>, and your
              gaming guild is named after a potato — we should probably
              talk.
            </p>
            <div className="colophon__btn-row">
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
            <ul className="colophon__list">
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
                <a href="#">
                  Star Citizen org <span className="arr">↗</span>
                </a>
              </li>
              <li>
                <a href="#">
                  MakerWorld <span className="arr">↗</span>
                </a>
              </li>
              <li>
                <a href="/rss.xml">
                  RSS <span className="arr">→</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Index</h4>
            <ul className="colophon__list">
              <li>
                <a href="#projects">
                  Projects <span className="arr">↑</span>
                </a>
              </li>
              <li>
                <a href="#workbench">
                  Workbench <span className="arr">↑</span>
                </a>
              </li>
              <li>
                <a href="#ramblings">
                  Ramblings <span className="arr">↑</span>
                </a>
              </li>
              <li>
                <a href="#cluster">
                  Cluster <span className="arr">↑</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Colophon</h4>
            <p className="colophon__credit">
              Set in <em>IBM Plex Sans</em> &amp; <em>JetBrains Mono</em>.
              Composed in Auckland. Hosted on the cluster above. For the
              guilds we&apos;ve named <em>kwisatz taterach</em>,{" "}
              <em>Frycarus</em>, and <em>Pirates of the Carbohydrates</em>{" "}
              — you know who you are.
            </p>
          </div>
        </div>

        <div className="imprint">
          <div className="imprint__brand">
            <span className="imprint__brand-dot" aria-hidden="true" />
            <span>nerdz.cloud</span>
          </div>
          <div className="imprint__center">
            © <span className="gold">MMXXVI</span> Gavin McFall · cc by-nc-sa
            4.0
          </div>
          <div className="imprint__right">
            if you&apos;ve read this far · you might be the right kind of nerd
          </div>
        </div>
      </div>
    </footer>
  );
}
