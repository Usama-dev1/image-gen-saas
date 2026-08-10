"use server";

import { authGuard } from "@/lib/auth-guard";
import { SavedPrompt } from "@/models/SavedPrompt";
import connectDB from "@/lib/db";
import { z } from "zod";

const savePromptSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  prompt: z.string().min(1, "Prompt is required").max(2000),
  modelSlug: z.string().default("pollinations"),
  negativePrompt: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).default({}),
});

export type SavePromptInput = z.infer<typeof savePromptSchema>;

export async function savePromptAction(input: SavePromptInput) {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const parsed = savePromptSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  try {
    await connectDB();
    const savedPrompt = await SavedPrompt.create({
      userId,
      title: data.title,
      prompt: data.prompt,
      modelSlug: data.modelSlug,
      negativePrompt: data.negativePrompt,
      settings: data.settings,
    });

    // Return a plain object, not a mongoose document
    return { 
      success: true,
      data: {
        id: savedPrompt._id.toString(),
        title: savedPrompt.title,
      } 
    };
  } catch (err: any) {
    console.error("[savePromptAction]", err, userId);
    return { error: "Failed to save prompt" };
  }
}

export async function deletePromptAction(id: string) {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  if (!id) {
    return { error: "Prompt ID is required" };
  }

  try {
    await connectDB();
    
    // Ensure the prompt belongs to the user
    const deletedPrompt = await SavedPrompt.findOneAndDelete({ _id: id, userId });
    
    if (!deletedPrompt) {
      return { error: "Prompt not found or unauthorized" };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error("[deletePromptAction]", err, userId);
    return { error: "Failed to delete prompt" };
  }
}

const updatePromptSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  prompt: z.string().min(1, "Prompt is required").max(2000).optional(),
  modelSlug: z.string().optional(),
  negativePrompt: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export async function updatePromptAction(id: string, input: unknown) {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  if (!id) {
    return { error: "Prompt ID is required" };
  }

  const parsed = updatePromptSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await connectDB();
    
    // Ensure the prompt belongs to the user and update it
    const updatedPrompt = await SavedPrompt.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed.data },
      { returnDocument: "after" }
    );
    
    if (!updatedPrompt) {
      return { error: "Prompt not found or unauthorized" };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error("[updatePromptAction]", err, userId);
    return { error: "Failed to update prompt" };
  }
}
