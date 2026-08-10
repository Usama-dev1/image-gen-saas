"use server";

import connectDB from "@/lib/db";
import { Generation } from "@/models/Generation";
import { authGuard } from "@/lib/auth-guard";

export async function deleteGenerationAction(id: string) {
  try {
    const userId = await authGuard();
    await connectDB();

    const result = await Generation.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isDeleted: true } }
    );

    if (!result) {
      return { error: "Generation not found" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[deleteGenerationAction] failed", { id, error });
    return { error: error.message || "Failed to delete generation" };
  }
}
