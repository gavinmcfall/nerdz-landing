import type { Metadata } from "next";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import "./manuals.css";

// Scopes the field-manuals chrome to /manuals/*. The shared shell (Topbar,
// Colophon, PageTransition) is provided by the root layout; this adds the
// reader's floating AccessibilityMenu and the manuals stylesheet.
export const metadata: Metadata = {
  title: "Field Manuals — nerdz.cloud",
  description:
    "Printable field manuals by Gavin McFall — quick-reference cards for Star Citizen, 3D printing, homelab, and adjacent nerdery.",
};

export default function ManualsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AccessibilityMenu />
      {children}
    </>
  );
}
