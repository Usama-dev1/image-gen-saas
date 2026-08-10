import { NextResponse } from "next/server";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Generation } from "@/models/Generation";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const userId = await authGuard();
    await connectDB();

    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recentGenerations = await Generation.find({ userId, isDeleted: false })
      .sort({ _id: -1 })
      .limit(5)
      .lean();

    // Since we don't have Character or SavedPrompt models fully implemented yet,
    // we can default these counts to 0 for now or try to count them if the model is registered.
    const characterCount = mongoose.models.Character 
      ? await mongoose.models.Character.countDocuments({ userId, isDeleted: false }) 
      : 0;

    const savedPromptCount = mongoose.models.SavedPrompt
      ? await mongoose.models.SavedPrompt.countDocuments({ userId })
      : 0;

    return NextResponse.json({
      credits: user.credits || 0,
      storageUsedBytes: user.storageUsedBytes || 0,
      plan: user.plan || "free",
      planExpiresAt: user.planExpiresAt || null,
      recentGenerations,
      characterCount,
      savedPromptCount,
      limits: user.limits,
    });
  } catch (error) {
    console.error("[dashboard-get] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
