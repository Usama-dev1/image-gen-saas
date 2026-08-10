import mongoose from "mongoose";

export enum PaymentStatus {
  COMPLETED = "completed",
  REFUNDED = "refunded",
}

export type PaymentDocument = {
  userId: string;
  providerSessionId: string;
  provider: string;
  amount: number;
  currency: string;
  plan: string;
  creditsAdded: number;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
};

const PaymentSchema = new mongoose.Schema<PaymentDocument>(
  {
    userId: { type: String, required: true, index: true },
    providerSessionId: { type: String, required: true, unique: true },
    provider: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "usd" },
    plan: { type: String, required: true },
    creditsAdded: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      default: PaymentStatus.COMPLETED,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment =
  mongoose.models.Payment ||
  mongoose.model<PaymentDocument>("Payment", PaymentSchema);
