import mongoose from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
}

export type UserLimits = {
  maxCredits?: number;
  maxGenerationsPerDay?: number;
  maxStorage?: number;
  maxCharacters?: number;
  maxBatchSize?: number;
};

export type UserDocument = {
  _id: string;
  name?: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  role: UserRole;
  status: UserStatus;
  credits: number;
  storageUsedBytes: number;
  plan: string;
  planExpiresAt?: Date;
  limits: UserLimits;
  apiKeys?: any;
  billingSubscriptionId?: string;
  billingCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId as any, auto: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean },
    image: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    credits: { type: Number, default: 0 },
    storageUsedBytes: { type: Number, default: 0 },
    plan: { type: String, default: "free" },
    planExpiresAt: { type: Date },
    limits: { type: mongoose.Schema.Types.Mixed, default: {} },
    apiKeys: { type: mongoose.Schema.Types.Mixed },
    billingSubscriptionId: { type: String },
    billingCustomerId: { type: String },
  },
  {
    timestamps: true,
    collection: "user", // Matches Better Auth's default MongoDB collection name
    strict: false, // Preserves Better Auth specific fields
  }
);

export const User = mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

