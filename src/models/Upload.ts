import mongoose from "mongoose";

export enum UploadPurpose {
  REFERENCE = "reference",
  INPUT = "input",
  AVATAR = "avatar",
  OUTPUT = "output",
}

export type UploadDocument = {
  userId: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType: string;
  folder: string;
  purpose: UploadPurpose;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const UploadSchema = new mongoose.Schema<UploadDocument>(
  {
    userId: { type: String, required: true, index: true },
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    resourceType: { type: String, required: true },
    folder: { type: String, required: true, index: true },
    purpose: {
      type: String,
      enum: Object.values(UploadPurpose),
      required: true,
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

export const Upload =
  mongoose.models.Upload ||
  mongoose.model<UploadDocument>("Upload", UploadSchema);
