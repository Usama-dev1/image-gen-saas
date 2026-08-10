import { Metadata } from "next";
import { CharactersContainer } from "./CharactersContainer";

export function generateMetadata(): Metadata {
  return {
    title: "Characters | Consistent AI",
    description: "Manage your saved character identities.",
  };
}

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page as string) || 1;

  return <CharactersContainer page={page} />;
}
