import { NextResponse } from "next/server";
import { authGuard } from "@/lib/auth-guard";
import { Generation } from "@/models/Generation";
import { User } from "@/models/User";
import connectDB from "@/lib/db";
import { pollinationsAdapter } from "@/lib/ai/pollinations";
import { CloudinaryAdapter } from "@/lib/storage/cloudinary";
import { refundCredits } from "@/lib/credits";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const generation = await Generation.findOne({ _id: id, userId });
    
    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    // If already terminal state, return immediately without re-checking
    if (generation.status === "succeeded" || generation.status === "failed") {
      return NextResponse.json({
        status: generation.status,
        outputUrl: generation.outputUrl,
        errorMessage: generation.errorMessage,
      });
    }

    // Check status with our provider
    const providerStatus = await pollinationsAdapter.checkStatus(generation.providerJobId);

    if (providerStatus.status === "failed") {
      // Mark as failed and refund
      generation.status = "failed";
      generation.errorMessage = providerStatus.errorMessage;
      await generation.save();
      await refundCredits(userId, generation.creditCost);
      
      return NextResponse.json({
        status: "failed",
        errorMessage: providerStatus.errorMessage,
      });
    }

    if (providerStatus.status === "succeeded" && providerStatus.outputUrl) {
      // It's finished! Now we need to upload the image to Cloudinary to save it permanently
      try {
        // 1. Fetch image directly to buffer to avoid Cloudinary remote fetch timeout (499)
        const imageRes = await fetch(providerStatus.outputUrl);
        if (!imageRes.ok) {
          throw new Error(`Failed to fetch generated image: ${imageRes.statusText}`);
        }
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Upload buffer to Cloudinary
        const uploadResult = await CloudinaryAdapter.uploadFile(buffer, {
          folder: `users/${userId}/generations`,
          resourceType: "image",
        });

        // Update User's storage quota
        await User.findByIdAndUpdate(userId, {
          $inc: { storageUsedBytes: uploadResult.bytes }
        });

        // Update Generation document
        generation.status = "succeeded";
        generation.outputUrl = uploadResult.secureUrl;
        generation.uploadId = uploadResult.publicId;
        await generation.save();

        return NextResponse.json({
          status: "succeeded",
          outputUrl: generation.outputUrl,
        });
      } catch (uploadError) {
        console.error("[generate-status] Cloudinary upload failed:", uploadError);
        generation.status = "failed";
        generation.errorMessage = "Failed to save generated image to storage";
        await generation.save();
        await refundCredits(userId, generation.creditCost);

        return NextResponse.json({
          status: "failed",
          errorMessage: "Failed to save generated image",
        });
      }
    }

    // Still pending/processing
    return NextResponse.json({
      status: providerStatus.status,
    });

  } catch (error) {
    console.error("[generate-status] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
