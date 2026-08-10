import mongoose from "mongoose";

export type SavedPromptDocument = {
  userId: string;
  title: string;
  modelSlug: string;
  prompt: string;
  negativePrompt?: string;
  settings?: any;
  isSystemTemplate?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const SavedPromptSchema = new mongoose.Schema<SavedPromptDocument>(
  {
    userId: { type: String, required: false, index: true },
    title: { type: String, required: true },
    modelSlug: { type: String, required: true },
    prompt: { type: String, required: true },
    negativePrompt: { type: String },
    settings: { type: mongoose.Schema.Types.Mixed },
    isSystemTemplate: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const SavedPrompt =
  mongoose.models.SavedPrompt ||
  mongoose.model<SavedPromptDocument>("SavedPrompt", SavedPromptSchema);
