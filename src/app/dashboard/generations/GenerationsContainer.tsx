import { GenerationsView } from "./GenerationsView";
import { GenerationItem } from "./GenerationCard";
import { authGuard } from "@/lib/auth-guard";
import { Generation } from "@/models/Generation";
import connectDB from "@/lib/db";

const PAGE_LIMIT = 10;

export async function GenerationsContainer({ cursor, filters }: { cursor?: string, filters?: { status?: string, model?: string, source?: string } }) {
  const userId = await authGuard();
  await connectDB();

  const query: any = { userId, isDeleted: false };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  if (filters?.status) query.status = filters.status;
  if (filters?.model) query.modelSlug = filters.model;
  if (filters?.source) query.source = filters.source;

  // Fetch actual data from DB
  const rawGenerations = await Generation.find(query)
    .sort({ createdAt: -1 })
    .limit(PAGE_LIMIT)
    .lean();

  const generations: GenerationItem[] = rawGenerations.map((g: any) => {
    // Format date nicely
    const dateStr = g.createdAt instanceof Date
      ? g.createdAt.toLocaleDateString() + " " + g.createdAt.toLocaleTimeString()
      : new Date(g.createdAt).toLocaleString();

    return {
      id: g._id.toString(),
      outputUrl: g.outputUrl,
      prompt: g.prompt,
      modelSlug: g.modelSlug,
      status: g.status,
      createdAt: dateStr,
      cost: g.creditCost || 1,
    };
  });

  const hasMore = rawGenerations.length === PAGE_LIMIT;
  const nextCursor = hasMore ? generations[generations.length - 1].id : undefined;

  return <GenerationsView generations={generations} nextCursor={nextCursor} />;
}

