import { Metadata } from "next";
import { DashboardContainer } from "./DashboardContainer";

export function generateMetadata(): Metadata {
  return {
    title: "Dashboard | AI Image Generator",
    description: "View your recent generations, credits, and quick actions.",
  };
}

export default function DashboardPage() {
  return <DashboardContainer />;
}
