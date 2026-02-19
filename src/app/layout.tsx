import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nerdz Cloud — Homelab Infrastructure",
  description:
    "A fully automated, GitOps-driven Kubernetes homelab. Powered by Talos Linux, Flux, and a passion for self-hosting.",
  metadataBase: new URL("https://nerdz.cloud"),
  openGraph: {
    title: "Nerdz Cloud — Homelab Infrastructure",
    description:
      "A fully automated, GitOps-driven Kubernetes homelab. Powered by Talos Linux, Flux, and a passion for self-hosting.",
    url: "https://nerdz.cloud",
    siteName: "Nerdz Cloud",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Nerdz Cloud",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nerdz Cloud — Homelab Infrastructure",
    description:
      "A fully automated, GitOps-driven Kubernetes homelab. Powered by Talos Linux, Flux, and a passion for self-hosting.",
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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased noise`}
      >
        {children}
      </body>
    </html>
  );
}
