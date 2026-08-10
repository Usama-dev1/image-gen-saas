import { PromptsView, PromptItem } from "./PromptsView";
import { SavedPrompt } from "@/models/SavedPrompt";
import connectDB from "@/lib/db";
import { authGuard } from "@/lib/auth-guard";

export async function PromptsContainer({ page }: { page: number }) {
  const userId = await authGuard();
  await connectDB();

  const limit = 10;
  const skip = (page - 1) * limit;

  const [userPrompts, totalCount] = await Promise.all([
    SavedPrompt.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SavedPrompt.countDocuments({ userId })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const prompts: PromptItem[] = userPrompts.map((doc: any) => {
    const date = new Date(doc.createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return {
      id: doc._id.toString(),
      title: doc.title,
      modelSlug: doc.modelSlug,
      prompt: doc.prompt,
      negativePrompt: doc.negativePrompt,
      createdAt: formattedDate,
    };
  });

  return <PromptsView prompts={prompts} currentPage={page} totalPages={totalPages} />;
}
