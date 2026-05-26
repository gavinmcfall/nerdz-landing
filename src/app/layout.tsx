import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${jetbrainsMono.variable}`}>
        {children}
        {/* shared shell telemetry pill — see docs/unified-shell-spec.md §4 */}
        <Script src="/nerdz-status.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
