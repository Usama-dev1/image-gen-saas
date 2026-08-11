/**
 * Billing Checkout API Route (Provider-Agnostic)
 *
 * Endpoint URL:
 * - Production: POST https://image-gen-saas-pi.vercel.app/api/billing/checkout
 * - Development: POST http://localhost:3000/api/billing/checkout
 *
 * Purpose:
 * Creates a checkout session for subscription plan upgrades ("pro" or "max")
 * or one-time credit refill purchases ("refill").
 * Delegates all provider-specific logic to the BillingAdapter.
 *
 * Request Payload (JSON):
 * { "plan": "pro" | "max" | "refill" }
 *
 * Response Payload (JSON):
 * { "url": "https://checkout.stripe.com/c/pay/cs_test_..." }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { stripeBillingAdapter } from "@/lib/billing/stripe";

// 1. Zod schema for validating incoming request payload
const checkoutSchema = z.object({
  plan: z.enum(["pro", "max", "refill"]),
});

export const POST = async (req: Request) => {
  try {
    // Step 1: Authenticate the requesting user via Better Auth session guard
    const userId = await authGuard();

    // Step 2: Validate JSON payload using Zod schema
    const body = await req.json();
    console.log("[billing/checkout] called", { userId, body });
    const { plan } = checkoutSchema.parse(body);

    // Step 3: Connect to MongoDB and retrieve user document
    await connectDB();
    const user = await User.findById(userId).select("email plan billingCustomerId billingSubscriptionId").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 4: Determine base application URL for success/cancel redirects
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000";

    // Step 5: Delegate to BillingAdapter — all provider-specific logic is encapsulated there
    const checkoutParams = {
      userId,
      userEmail: user.email,
      plan,
      billingCustomerId: user.billingCustomerId,
      billingSubscriptionId: user.billingSubscriptionId,
      currentPlan: user.plan,
      origin,
    };
    const result = await stripeBillingAdapter.createCheckout(checkoutParams);

    // Step 6: Return the checkout URL to client for browser redirection
    return NextResponse.json({ url: result.url });
  } catch (error: any) {
    console.error("[billing/checkout] error", error);

    // Return user-facing errors (like duplicate subscription) with 400
    if (error.message === "You are already subscribed to this plan.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
};
