import mongoose from "mongoose";

export type UserDocument = {
  _id: string;
  name?: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  role: "user" | "admin" | "super_admin";
  credits: number;
  plan: string;
  planExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean },
    image: { type: String },
    role: { 
      type: String, 
      enum: ["user", "admin", "super_admin"], 
      default: "user" 
    },
    credits: { type: Number, default: 0 },
    plan: { type: String, default: "free" },
    planExpiresAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "user", // Matches Better Auth's default MongoDB collection name
    strict: false, // Preserves Better Auth specific fields
  }
);

export const User = mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
