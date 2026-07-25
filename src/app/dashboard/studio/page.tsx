import { Metadata } from "next";
import { StudioContainer } from "./StudioContainer";

export function generateMetadata(): Metadata {
  return {
    title: "AI Character Studio | Dashboard",
    description: "Design consistent AI characters with precision.",
  };
}

export default function StudioPage() {
  return <StudioContainer />;
}
