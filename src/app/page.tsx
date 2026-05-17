import { Topbar } from "@/components/Topbar";
import { Hero } from "@/components/Hero";
import { Workshop } from "@/components/Workshop";
import { Workbench } from "@/components/Workbench";
import { Ramblings } from "@/components/Ramblings";
import { Cluster } from "@/components/Cluster";
import { Colophon } from "@/components/Colophon";

export default function Home() {
  return (
    <>
      <Topbar />
      <main>
        <Hero />
        <Workshop />
        <Workbench />
        <Ramblings />
        <Cluster />
      </main>
      <Colophon />
    </>
  );
}
