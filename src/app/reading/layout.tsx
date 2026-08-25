import type { Metadata } from "next";
import "./reading.css";

// Scopes the reading-shelf styles to /reading/*. The shared shell (Topbar,
// Colophon, PageTransition) is provided by the root layout.
export const metadata: Metadata = {
  title: "Reading — nerdz.cloud",
  description:
    "Reading guides and checklists by Gavin McFall — interactive book reading orders that remember your place, with printable PDF versions.",
};

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
