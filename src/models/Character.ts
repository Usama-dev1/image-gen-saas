import mongoose from "mongoose";

export type CharacterDocument = {
  userId: string;
  name: string;
  avatarUrl?: string;
  avatarUploadId?: string;
  referenceUrls: string[];
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const CharacterSchema = new mongoose.Schema<CharacterDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    avatarUploadId: { type: String },
    referenceUrls: { type: [String], default: [] },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Character =
  mongoose.models.Character ||
  mongoose.model<CharacterDocument>("Character", CharacterSchema);
