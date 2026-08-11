import { Metadata } from "next";
import { GenerationsContainer } from "./GenerationsContainer";

export function generateMetadata(): Metadata {
  return {
    title: "Library | Consistent AI",
    description: "Browse your entire history of generated images.",
  };
}

export default async function GenerationsPage({ searchParams }: { searchParams: Promise<{ cursor?: string, status?: string, model?: string, source?: string }> }) {
  const params = await searchParams;
  const filters = {
    status: params.status,
    model: params.model,
    source: params.source,
  };
  return <GenerationsContainer cursor={params.cursor} filters={filters} />;
}
