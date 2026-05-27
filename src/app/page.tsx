import { Hero } from "@/components/Hero";
import { Teasers } from "@/components/Teasers";
import { Ramblings } from "@/components/Ramblings";

// Slim landing: hero + teaser cards into each destination + latest ramblings.
// The full sections now live on their own routes (Topbar/Colophon are in the
// root layout, so navigation between them is SPA with no page load).
export default function Home() {
  return (
    <>
      <Hero />
      <Teasers />
      <Ramblings />
    </>
  );
}
