import type { Metadata } from "next";
import { Workshop } from "@/components/Workshop";

export const metadata: Metadata = {
  title: "Projects — nerdz.cloud",
  description:
    "Self-hostable tools Gavin McFall is building — SC Bridge, Loot Goblin, Realmstack, and more.",
};

export default function ProjectsPage() {
  return <Workshop />;
}
