import { NextResponse } from "next/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe/stripe";
import connectDB from "@/lib/db";
import { Payment, PaymentStatus } from "@/models/Payment";
import { User } from "@/models/User";

const PRO_PLAN_CREDITS = 500;
const MAX_PLAN_CREDITS = 2000;
const DEFAULT_CREDITS = 500;

const PLAN_CREDITS_MAP: Record<string, number> = {
  pro: PRO_PLAN_CREDITS,
  max: MAX_PLAN_CREDITS,
};

export const POST = async (req: Request) => {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("[webhooks/stripe] Missing signature or STRIPE_WEBHOOK_SECRET");
      return NextResponse.json(
        { error: "Missing webhook configuration" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // 1. Verify Stripe Webhook Signature
    try {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
    } catch (err: any) {
      console.error("[webhooks/stripe] Signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log("[webhooks/stripe] Event received:", { type: event.type, id: event.id });

    // 2. Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId || session.client_reference_id;
      const plan = session.metadata?.plan || "pro";

      if (!userId) {
        console.error("[webhooks/stripe] Missing userId in session metadata", { sessionId: session.id });
        return NextResponse.json({ received: true });
      }

      await connectDB();

      // 3. Idempotency check: prevent duplicate credit grants
      const existingPayment = await Payment.findOne({ providerSessionId: session.id });
      if (existingPayment) {
        console.log("[webhooks/stripe] Payment already processed for session:", session.id);
        return NextResponse.json({ received: true });
      }

      const creditsToAdd = PLAN_CREDITS_MAP[plan] || DEFAULT_CREDITS;
      const amountInDollars = session.amount_total ? session.amount_total / 100 : 0;

      // 4. Record Payment document in MongoDB
      await Payment.create({
        userId,
        providerSessionId: session.id,
        provider: "stripe",
        amount: amountInDollars,
        currency: session.currency || "usd",
        plan,
        creditsAdded: creditsToAdd,
        status: PaymentStatus.COMPLETED,
      });

      // 5. Update customer and subscription IDs on user document
      const customerId = typeof session.customer === "string" ? session.customer : undefined;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : undefined;

      const updatePayload: Record<string, any> = {
        plan: plan,
      };

      if (customerId) {
        updatePayload.billingCustomerId = customerId;
      }
      if (subscriptionId) {
        updatePayload.billingSubscriptionId = subscriptionId;
      }

      // Grant credits and update user plan in MongoDB using atomic operators
      await User.findByIdAndUpdate(userId, {
        $inc: { credits: creditsToAdd },
        $set: updatePayload,
      });

      console.log("[webhooks/stripe] Granted credits and updated user plan", {
        userId,
        creditsToAdd,
        plan,
        customerId,
        subscriptionId,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[webhooks/stripe] Error processing webhook", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
};
