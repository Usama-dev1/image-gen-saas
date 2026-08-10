import { NextResponse } from "next/server";
import { authGuard } from "@/lib/auth-guard";
import { validateBody } from "@/lib/validate";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Generation, GenerationSource } from "@/models/Generation";
import { deductCredits, refundCredits, InsufficientCreditsError } from "@/lib/credits";
import { pollinationsAdapter } from "@/lib/ai/pollinations";
import { checkRateLimit } from "@/lib/rate-limit";

const generateSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(2000),
  negativePrompt: z.string().max(1000).optional(),
  modelSlug: z.string().default("pollinations/default"),
  settings: z.any().optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Auth Guard
    const userId = await authGuard();

    // 2. Validate Body
    const { data, errorResponse } = await validateBody(req, generateSchema);
    if (errorResponse) return errorResponse;

    await connectDB();

    // 3. Enforce Storage Quota
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status === "banned") {
      return NextResponse.json({ error: "User is banned" }, { status: 403 });
    }

    // 3. Rate Limiting
    const maxGenerationsPerDay = user.limits?.maxGenerationsPerDay || 50;
    const rateLimit = await checkRateLimit(userId, "generate", maxGenerationsPerDay);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Daily generation limit reached" }, { status: 429 });
    }

    // 4. Enforce Storage Quota
    // Default max storage to 5GB if not specified
    const maxStorage = user.limits?.maxStorage || 5 * 1024 * 1024 * 1024;
    if (user.storageUsedBytes >= maxStorage) {
      return NextResponse.json({ error: "Storage quota exceeded" }, { status: 403 });
    }

    // We assume 1 credit per generation for now
    const creditCost = 1;

    // 4. Deduct Credits Upfront (Escrow)
    try {
      await deductCredits(userId, creditCost);
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
      }
      throw error;
    }

    // 5. Create Generation Doc (pending)
    const generation = new Generation({
      userId,
      prompt: data!.prompt,
      negativePrompt: data!.negativePrompt,
      modelSlug: data!.modelSlug,
      settings: data!.settings || {},
      creditCost,
      source: GenerationSource.STUDIO,
    });
    await generation.save();

    // 6. Start Generation with AI Provider
    try {
      const result = await pollinationsAdapter.startGeneration(
        data!.modelSlug,
        data!.prompt,
        { ...data!.settings, negativePrompt: data!.negativePrompt }
      );
      
      // Update generation with providerJobId
      generation.providerJobId = result.providerJobId;
      await generation.save();

      // Return immediately for async polling
      return NextResponse.json({
        generationId: generation._id,
        status: generation.status,
      });

    } catch (providerError: any) {
      // Synchronous failure: Refund credits immediately
      console.error("[generate-route] Provider error:", providerError);
      
      generation.status = "failed";
      generation.errorMessage = providerError.message || "Provider failed to start generation";
      await generation.save();

      await refundCredits(userId, creditCost);

      return NextResponse.json(
        { error: "AI Provider failed to start generation" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("[generate-route] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
