import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { Topbar } from "@/components/Topbar";
import { Colophon } from "@/components/Colophon";
import { PageTransition } from "@/components/PageTransition";
import { Atmosphere } from "@/components/Atmosphere";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Self-hostable tools for the nerdy hobbies Gavin McFall loves — Star Citizen, 3D printing, TTRPGs — and the homelab they all run on.";

export const metadata: Metadata = {
  title: "nerdz.cloud — Gavin McFall",
  description,
  metadataBase: new URL("https://nerdz.cloud"),
  openGraph: {
    title: "nerdz.cloud — Gavin McFall",
    description,
    url: "https://nerdz.cloud",
    siteName: "nerdz.cloud",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "nerdz.cloud",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "nerdz.cloud — Gavin McFall",
    description,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No-flash theme script: runs synchronously in <head> before CSS applies, so
  // a returning visitor's saved light preference (or system preference) is on
  // the <html> as data-theme="light" before first paint — no flash of dark.
  // Dark stays the default (no attribute). suppressHydrationWarning on <html>
  // because this script mutates the document before React hydrates.
  const themeScript = `(function(){try{var t=localStorage.getItem('nerdz-theme');if(!t)t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${plexSans.variable} ${jetbrainsMono.variable}`}>
        <Topbar />
        <main id="main" className="page-stage">
          {/* Atmosphere reads ?atm=… and renders the cinematic background
              layer (aurora/grid/spotlight/noise) for A/B testing. Suspense
              keeps /  statically prerendered (useSearchParams is client). */}
          <Suspense fallback={null}>
            {/* Default: full atmosphere on every page. Override per-view with
                ?atm=noise / ?atm=aurora,grid / ?atm=none (off). */}
            <Atmosphere defaultAtm="all" />
          </Suspense>
          <PageTransition>{children}</PageTransition>
        </main>
        <Colophon />
        {/* shared shell telemetry pill — see docs/unified-shell-spec.md §4 */}
        <Script src="/nerdz-status.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
