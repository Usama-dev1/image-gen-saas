import { Metadata } from "next";
import { PromptsContainer } from "./PromptsContainer";

export function generateMetadata(): Metadata {
  return {
    title: "Saved Prompts | Consistent AI",
    description: "Manage your saved prompt templates.",
  };
}

export default async function PromptsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const pageStr = searchParams.page;
  const page = typeof pageStr === "string" ? parseInt(pageStr, 10) : 1;
  const validPage = isNaN(page) || page < 1 ? 1 : page;

  return <PromptsContainer page={validPage} />;
}
