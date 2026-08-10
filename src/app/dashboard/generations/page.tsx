import { Metadata } from "next";
import { GenerationsContainer } from "./GenerationsContainer";

export function generateMetadata(): Metadata {
  return {
    title: "Library | Consistent AI",
    description: "Browse your entire history of generated images.",
  };
}

export default async function GenerationsPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const params = await searchParams;
  return <GenerationsContainer cursor={params.cursor} />;
}
