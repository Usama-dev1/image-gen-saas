"use server";

import { z } from "zod";
import { authGuard } from "@/lib/auth-guard";
import { deductCredits, refundCredits, InsufficientCreditsError } from "@/lib/credits";
import { pollinationsAdapter } from "@/lib/ai/pollinations";
import { Generation } from "@/models/Generation";
import { Character } from "@/models/Character";
import { User } from "@/models/User";
import connectDB from "@/lib/db";

const generateSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  modelSlug: z.string().default("pollinations"),
  settings: z.record(z.string(), z.unknown()).default({}),
});

export type GenerateInput = z.infer<typeof generateSchema>;

export async function startGenerationAction(input: GenerateInput) {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  const { prompt, modelSlug, settings } = data;
  const creditCost = 1;

  try {
    // Check daily generation limit
    await connectDB();
    const user = await User.findById(userId).select("limits").lean();
    const dailyLimit = user?.limits?.maxGenerationsPerDay || 50;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCount = await Generation.countDocuments({
      userId,
      createdAt: { $gte: todayStart },
    });

    if (todayCount >= dailyLimit) {
      return { error: `Daily generation limit reached (${dailyLimit}). Try again tomorrow.` };
    }

    // 1. Escrow: Deduct credits upfront
    await deductCredits(userId, creditCost);
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return { error: "Insufficient credits" };
    }
    console.error("[startGenerationAction] credit deduction failed", error);
    return { error: "Internal server error" };
  }

  // Inject character reference URLs if a character is selected
  if (settings.characterId && typeof settings.characterId === "string") {
    try {
      await connectDB();
      const character = await Character.findOne({ _id: settings.characterId, userId, isDeleted: { $ne: true } }).lean();
      if (character && character.referenceUrls) {
        settings.referenceUrls = character.referenceUrls;
      }
    } catch (err) {
      console.error("[startGenerationAction] failed to fetch character references", err);
    }
  }

  let providerJobId: string;
  try {
    // 2. Start generation
    const result = await pollinationsAdapter.startGeneration(modelSlug, prompt, settings);
    providerJobId = result.providerJobId;
  } catch (error) {
    // Refund credits if generation instantly fails
    console.error("[startGenerationAction] provider start failed, refunding credits", error);
    await refundCredits(userId, creditCost);
    return { error: "Failed to start generation" };
  }

  try {
    // 3. Save to database
    await connectDB();
    const generation = await Generation.create({
      userId,
      prompt,
      status: "pending",
      source: "studio",
      modelSlug,
      settings,
      creditCost,
      providerJobId,
    });

    return {
      generationId: generation._id.toString(),
      status: "pending",
    };
  } catch (error) {
    console.error("[startGenerationAction] db save failed", error);
    // Technically we should refund here too if DB save fails, but for now we'll handle it gracefully
    await refundCredits(userId, creditCost);
    return { error: "Failed to save generation" };
  }
}
