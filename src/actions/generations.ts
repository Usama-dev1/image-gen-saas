"use server";

import { authGuard } from "@/lib/auth-guard";
import { Generation } from "@/models/Generation";
import connectDB from "@/lib/db";

export async function getGenerationsAction(cursor?: string, limit: number = 20) {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  try {
    await connectDB();

    const query: any = { userId, isDeleted: false };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const generations = await Generation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Serialize _id and other complex objects for Server Actions
    const serialized = generations.map(g => {
      const dateObj = new Date(g.createdAt);
      return {
        id: g._id.toString(),
        outputUrl: g.outputUrl,
        prompt: g.prompt,
        modelSlug: g.modelSlug,
        status: g.status,
        createdAt: dateObj.toISOString(),
        cost: g.creditCost || 1,
        // Include _id to match previous API behavior for cursor
        _id: g._id.toString()
      };
    });

    return {
      data: serialized,
    };
  } catch (error) {
    console.error("[getGenerationsAction]", error);
    return { error: "Internal server error" };
  }
}
