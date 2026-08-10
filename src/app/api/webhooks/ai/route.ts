import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Generation } from "@/models/Generation";
import { CloudinaryAdapter } from "@/lib/storage/cloudinary";
import { User } from "@/models/User";
import { refundCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { providerJobId, status, outputUrl, errorMessage } = body;

    if (!providerJobId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const generation = await Generation.findOne({ providerJobId });
    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    if (generation.status === "succeeded" || generation.status === "failed") {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    if (status === "failed") {
      generation.status = "failed";
      generation.errorMessage = errorMessage || "Generation failed";
      await generation.save();
      await refundCredits(generation.userId, generation.creditCost);
      return NextResponse.json({ success: true });
    }

    if (status === "succeeded" && outputUrl) {
      try {
        const imageRes = await fetch(outputUrl);
        if (!imageRes.ok) {
          throw new Error("Failed to fetch image");
        }
        
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await CloudinaryAdapter.uploadFile(buffer, {
          folder: `users/${generation.userId}/generations`,
          resourceType: "image",
        });

        await User.findByIdAndUpdate(generation.userId, {
          $inc: { storageUsedBytes: uploadResult.bytes }
        });

        generation.status = "succeeded";
        generation.outputUrl = uploadResult.secureUrl;
        generation.uploadId = uploadResult.publicId;
        await generation.save();

        return NextResponse.json({ success: true });
      } catch (err) {
        console.error("[webhook-ai] Image processing error:", err);
        generation.status = "failed";
        generation.errorMessage = "Failed to process image";
        await generation.save();
        await refundCredits(generation.userId, generation.creditCost);
        return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Unhandled status" });
  } catch (error) {
    console.error("[webhook-ai] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
