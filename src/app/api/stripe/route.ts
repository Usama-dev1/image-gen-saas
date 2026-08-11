/**
 * Stripe Checkout Session API Route
 * 
 * Endpoint URL:
 * - Production: POST https://image-gen-saas-pi.vercel.app/api/stripe
 * - Development: POST http://localhost:3000/api/stripe
 * 
 * Purpose:
 * Creates a Stripe Checkout Session for subscription plan upgrades ("pro" or "max").
 * Returns a hosted Stripe Checkout URL ({ url }) for front-end redirection.
 * 
 * Request Payload (JSON):
 * { "plan": "pro" | "max" }
 * 
 * Response Payload (JSON):
 * { "url": "https://checkout.stripe.com/c/pay/cs_test_..." }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import stripe from "@/lib/stripe/stripe";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

// 1. Zod Schema for validating incoming request payload
const checkoutSchema = z.object({
  plan: z.enum(["pro", "max"]),
});

// 2. Map plan names to configured Stripe Price IDs in environment variables
const PLAN_PRICE_MAP = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  max: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID,
};

export const POST = async (req: Request) => {
  try {
    // Step 1: Authenticate the requesting user via Better Auth session guard
    const userId = await authGuard();

    // Step 2: Validate JSON payload using Zod schema
    const body = await req.json();
    console.log("[stripe/checkout] called", { userId, body });
    const { plan } = checkoutSchema.parse(body);

    const priceId = PLAN_PRICE_MAP[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid price ID configuration. Check environment variables." },
        { status: 400 }
      );
    }

    // Step 3: Connect to MongoDB and verify target user document exists
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 4: Determine base application URL for success/cancel redirects
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000";

    // Step 6: Call Stripe API to create a hosted checkout session with metadata
    const sessionPayload: any = {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
      },
    };

    // Reuse existing Stripe customer ID if available to avoid duplicate customer records
    if (user.billingCustomerId) {
      sessionPayload.customer = user.billingCustomerId;
    } else {
      sessionPayload.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    // Step 7: Return the Stripe checkout URL to client for browser redirection
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[stripe/checkout] error", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
};
