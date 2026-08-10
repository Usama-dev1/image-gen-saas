import mongoose from "mongoose";

export type ModelConfigDocument = {
  slug: string;
  label: string;
  description?: string;
  thumbnailUrl?: string;
  provider: string;
  enabled: boolean;
  creditCost: number;
  supportsByok: boolean;
  capabilities: {
    aspectRatios: string[];
    qualities: string[];
    maxPromptLength: number;
    supportsNegative: boolean;
  };
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

const ModelConfigSchema = new mongoose.Schema<ModelConfigDocument>(
  {
    slug: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    description: { type: String },
    thumbnailUrl: { type: String },
    provider: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    creditCost: { type: Number, required: true, default: 1 },
    supportsByok: { type: Boolean, default: false },
    capabilities: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        aspectRatios: ["1:1", "3:4", "16:9"],
        qualities: ["standard", "hd"],
        maxPromptLength: 1000,
        supportsNegative: true,
      },
    },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const ModelConfig =
  mongoose.models.ModelConfig ||
  mongoose.model<ModelConfigDocument>("ModelConfig", ModelConfigSchema);
