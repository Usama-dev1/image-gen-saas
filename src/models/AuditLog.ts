import mongoose from "mongoose";

export enum AuditLogTarget {
  USER = "user",
  MODEL = "model",
  GENERATION = "generation",
  PAYMENT = "payment",
  BATCH = "batch",
  CHARACTER = "character",
  UPLOAD = "upload",
  PROMPT = "prompt",
}

export type AuditLogDocument = {
  adminId: string;
  action: string;
  targetType: AuditLogTarget;
  targetId: string;
  details: any;
  createdAt: Date;
  updatedAt: Date;
};

const AuditLogSchema = new mongoose.Schema<AuditLogDocument>(
  {
    adminId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: Object.values(AuditLogTarget),
      required: true,
    },
    targetId: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

export const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>("AuditLog", AuditLogSchema);
