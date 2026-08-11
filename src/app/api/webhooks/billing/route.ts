/**
 * Provider-Agnostic Billing Webhook Receiver
 *
 * Endpoint URL:
 * - Production: POST https://image-gen-saas-pi.vercel.app/api/webhooks/billing
 * - Development: POST http://localhost:3000/api/webhooks/billing
 *
 * Purpose:
 * Receives webhook events from any billing provider (Stripe, LemonSqueezy, etc.).
 * Delegates event parsing and normalization to the BillingAdapter.
 * Handles database mutations: idempotency checks, granting credits, updating
 * subscription plans, and recording payment history.
 */

import { NextResponse } from "next/server";
import { stripeBillingAdapter } from "@/lib/billing/stripe";
import { BillingWebhookEvent } from "@/lib/adapters/billing";
import connectDB from "@/lib/db";
import { Payment, PaymentStatus } from "@/models/Payment";
import { User } from "@/models/User";
import { WebhookEvent } from "@/models/WebhookEvent";
import { logger } from "@/lib/logger";

export const POST = async (req: Request) => {
  try {
    // 1. Read raw body and signature header (required by providers for verification)
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logger.error("[webhooks/billing] Missing provider signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // 2. Delegate to the configured BillingAdapter
    // It verifies the signature, parses the provider-specific payload, and
    // returns a normalized WebhookResult (or null if the event type is unhandled).
    const result = await stripeBillingAdapter.handleWebhook(rawBody, signature);

    if (!result) {
      // Unhandled event type, silently acknowledge receipt
      return NextResponse.json({ received: true });
    }

    logger.info("[webhooks/billing] Parsed normalized event", {
      eventType: result.eventType,
      eventId: result.eventId,
      userId: result.userId,
    });

    await connectDB();

    // 3. Idempotency Check — enforce exactly-once processing using WebhookEvent model
    try {
      await WebhookEvent.create({
        eventId: result.eventId,
        provider: "stripe",
        type: result.eventType,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        logger.info("[webhooks/billing] Duplicate event skipped", { eventId: result.eventId });
        return NextResponse.json({ received: true });
      }
      throw err;
    }

    // 4. Handle normalized business logic based on event type
    switch (result.eventType) {
      case BillingWebhookEvent.SUBSCRIPTION_CREATED:
      case BillingWebhookEvent.PAYMENT_SUCCEEDED: {
        // Only require userId for events that grant credits
        if (!result.userId) {
          logger.error("[webhooks/billing] Missing userId in credit-granting event", { eventId: result.eventId });
          return NextResponse.json({ received: true });
        }

        // Record the transaction
        await Payment.create({
          userId: result.userId,
          providerSessionId: result.providerSessionId,
          provider: "stripe",
          amount: result.amountPaid,
          currency: result.currency,
          plan: result.plan,
          creditsAdded: result.creditsToGrant,
          status: PaymentStatus.COMPLETED,
        });

        // Prepare the payload for updating the User document
        const updatePayload: Record<string, any> = {};

        if (result.customerId) updatePayload.billingCustomerId = result.customerId;
        if (result.subscriptionId) updatePayload.billingSubscriptionId = result.subscriptionId;

        // Only update plan and expiration if it's a subscription (not a one-time refill)
        if (result.plan !== "refill") {
          updatePayload.plan = result.plan;
          if (result.planExpiresAt) {
            updatePayload.planExpiresAt = result.planExpiresAt;
          }
        }

        // Atomically increment credits and update fields
        await User.findByIdAndUpdate(result.userId, {
          $inc: { credits: result.creditsToGrant },
          ...(Object.keys(updatePayload).length > 0 ? { $set: updatePayload } : {}),
        });

        logger.info("[webhooks/billing] Processed successful payment", {
          userId: result.userId,
          creditsGranted: result.creditsToGrant,
          plan: result.plan,
        });
        break;
      }

      case BillingWebhookEvent.SUBSCRIPTION_CANCELED: {
        if (!result.customerId) {
          logger.error("[webhooks/billing] Missing customerId in cancellation event", { eventId: result.eventId });
          return NextResponse.json({ received: true });
        }

        // Revert user to free plan
        await User.findOneAndUpdate(
          { billingCustomerId: result.customerId },
          {
            $set: {
              plan: "free",
            },
            $unset: {
              billingSubscriptionId: "",
              planExpiresAt: "",
            },
          }
        );

        logger.info("[webhooks/billing] Processed subscription cancellation", { customerId: result.customerId });
        break;
      }

      case BillingWebhookEvent.PAYMENT_FAILED: {
        logger.warn("[webhooks/billing] Payment failed", {
          userId: result.userId,
          customerId: result.customerId,
          subscriptionId: result.subscriptionId,
        });
        // We only log failures. Subscriptions will eventually cancel via SUBSCRIPTION_CANCELED
        break;
      }
    }

    // 5. Acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error("[webhooks/billing] Error processing webhook", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
};
