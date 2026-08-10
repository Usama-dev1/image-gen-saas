import mongoose from "mongoose";

export type WebhookEventDocument = {
  eventId: string;
  provider: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

const WebhookEventSchema = new mongoose.Schema<WebhookEventDocument>(
  {
    eventId: { type: String, required: true, unique: true },
    provider: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const WebhookEvent =
  mongoose.models.WebhookEvent ||
  mongoose.model<WebhookEventDocument>("WebhookEvent", WebhookEventSchema);
