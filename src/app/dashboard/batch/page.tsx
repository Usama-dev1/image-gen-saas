import { Metadata } from "next";
import { BatchContainer } from "./BatchContainer";

export function generateMetadata(): Metadata {
  return {
    title: "Batch Generator | Dashboard",
    description: "Generate multiple character poses at once.",
  };
}

export default function BatchPage() {
  return <BatchContainer />;
}
