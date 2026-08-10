import connectDB from "./db";
import mongoose from "mongoose";
import { User } from "../models/User";

const rateLimitSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    route: { type: String, required: true },
    windowStart: { type: Date, required: true },
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// TTL index to automatically clear old windows (24h)
rateLimitSchema.index({ windowStart: 1 }, { expireAfterSeconds: 86400 });

export const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);

export async function checkRateLimit(
  userId: string,
  route: string,
  limitPerDay: number
): Promise<{ success: boolean; limit: number; remaining: number }> {
  await connectDB();

  // Sliding window: today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const record = await RateLimit.findOneAndUpdate(
    { userId, route, windowStart: startOfDay },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );

  const remaining = Math.max(0, limitPerDay - record.count);
  const success = record.count <= limitPerDay;

  return { success, limit: limitPerDay, remaining };
}
