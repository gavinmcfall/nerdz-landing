"use client";

import Image from "next/image";
import { Github } from "lucide-react";

const footerLinks = [
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: "https://github.com/gavinmcfall/home-ops" },
      { label: "Kromgo", href: "https://kromgo.nerdz.cloud" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://github.com/gavinmcfall", icon: Github },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-card-border mt-16">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-transparent.png"
                alt="Nerdz Cloud"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold tracking-tight">Nerdz Cloud</span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              A personal homelab project by{" "}
              <a
                href="https://github.com/gavinmcfall"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Gavin McFall
              </a>
              . Built with open source, powered by curiosity.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {"icon" in link && link.icon && (
                        <link.icon className="w-4 h-4" />
                      )}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-card-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Nerdz Cloud. Not a product, just a
            passion project.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/gavinmcfall/home-ops"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground transition-colors hover:bg-white/5"
            >
              <Github className="w-3.5 h-3.5" />
              Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
