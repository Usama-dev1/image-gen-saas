import mongoose from "mongoose";

export enum BatchJobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export type BatchJobDocument = {
  userId: string;
  name?: string;
  modelSlug: string;
  status: BatchJobStatus;
  totalCount: number;
  completedCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
};

const BatchJobSchema = new mongoose.Schema<BatchJobDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String },
    modelSlug: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(BatchJobStatus),
      required: true,
      default: BatchJobStatus.PENDING,
    },
    totalCount: { type: Number, required: true },
    completedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const BatchJob =
  mongoose.models.BatchJob ||
  mongoose.model<BatchJobDocument>("BatchJob", BatchJobSchema);
