import connectDB from "./db";
import { User } from "../models/User";

export class InsufficientCreditsError extends Error {
  constructor(message = "Insufficient credits") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Checks if a user has at least the requested amount of credits.
 */
export async function checkCredits(userId: string, amount: number): Promise<boolean> {
  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user) return false;
  return (user.credits || 0) >= amount;
}

/**
 * Atomically deducts credits from a user's balance.
 * Throws InsufficientCreditsError if they don't have enough.
 */
export async function deductCredits(userId: string, amount: number): Promise<void> {
  await connectDB();
  
  // Atomic findOneAndUpdate ensures no race conditions when deducting
  const result = await User.findOneAndUpdate(
    { _id: userId, credits: { $gte: amount } },
    { $inc: { credits: -amount } },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new InsufficientCreditsError();
  }
}

/**
 * Atomically refunds credits back to a user's balance.
 */
export async function refundCredits(userId: string, amount: number): Promise<void> {
  await connectDB();
  
  await User.findByIdAndUpdate(
    userId,
    { $inc: { credits: amount } }
  );
}
