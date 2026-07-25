import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    expiresAt: { type: Date, expires: 0 }, // TTL Index: Auto-deletes document when this date is reached
  },
  {
    collection: "session", // Must match Better Auth's collection
    strict: false, // Let Better Auth handle the rest of the fields
  }
);

export const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);
