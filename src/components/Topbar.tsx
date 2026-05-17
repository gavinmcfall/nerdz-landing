import { UptimeText } from "./UptimeText";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="frame topbar__inner">
        <a href="#" className="topbar__brand">
          <span className="topbar__brand-dot" aria-hidden="true" />
          nerdz.cloud
        </a>
        <div className="topbar__meta mono">
          <span>akl, nz</span>
          <span className="sep">·</span>
          <span>
            cluster <span className="gold">ok</span>
          </span>
          <span className="sep">·</span>
          <span>
            <UptimeText />
          </span>
        </div>
        <nav className="topbar__nav">
          <a href="#projects">projects</a>
          <a href="#workbench">workbench</a>
          <a href="#ramblings">ramblings</a>
          <a
            href="https://github.com/gavinmcfall"
            target="_blank"
            rel="noreferrer noopener"
            className="cta"
          >
            github →
          </a>
        </nav>
      </div>
    </header>
  );
}
