import mongoose from "mongoose";

export enum GenerationStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

export enum GenerationSource {
  STUDIO = "studio",
  BATCH = "batch",
}

export type GenerationDocument = {
  userId: string;
  prompt: string;
  negativePrompt?: string;
  status: GenerationStatus;
  source: GenerationSource;
  outputUrl?: string;
  uploadId?: string;
  inputImageUrl?: string;
  characterId?: string;
  batchId?: string;
  providerJobId?: string;
  modelSlug: string;
  settings: any;
  creditCost: number;
  errorMessage?: string;
  flagged: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const GenerationSchema = new mongoose.Schema<GenerationDocument>(
  {
    userId: { type: String, required: true, index: true },
    prompt: { type: String, required: true },
    negativePrompt: { type: String },
    status: {
      type: String,
      enum: Object.values(GenerationStatus),
      required: true,
      default: GenerationStatus.PENDING,
    },
    source: {
      type: String,
      enum: Object.values(GenerationSource),
      required: true,
    },
    outputUrl: { type: String },
    uploadId: { type: String, index: true },
    inputImageUrl: { type: String },
    characterId: { type: String, index: true },
    batchId: { type: String, index: true },
    providerJobId: { type: String },
    modelSlug: { type: String, required: true },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    creditCost: { type: Number, required: true, default: 1 },
    errorMessage: { type: String },
    flagged: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Generation =
  mongoose.models.Generation ||
  mongoose.model<GenerationDocument>("Generation", GenerationSchema);
