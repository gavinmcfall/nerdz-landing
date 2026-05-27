import type { Metadata } from "next";
import { Workbench } from "@/components/Workbench";
import { Cluster } from "@/components/Cluster";

export const metadata: Metadata = {
  title: "The Lab — nerdz.cloud",
  description:
    "The workbench and the homelab cluster it all runs on — with live telemetry.",
};

export default function LabPage() {
  return (
    <>
      <Workbench />
      <Cluster />
    </>
  );
}
