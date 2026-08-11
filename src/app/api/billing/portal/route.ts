/**
 * Billing Customer Portal API Route (Provider-Agnostic)
 *
 * Endpoint URL:
 * - Production: POST https://image-gen-saas-pi.vercel.app/api/billing/portal
 * - Development: POST http://localhost:3000/api/billing/portal
 *
 * Purpose:
 * Creates a customer portal session for authenticated users to manage,
 * update, or cancel their active subscriptions and view payment invoices.
 * Delegates all provider-specific logic to the BillingAdapter.
 *
 * Request Payload:
 * None (Authenticated via session cookie/header)
 *
 * Response Payload (JSON):
 * { "url": "https://billing.stripe.com/p/session/test_..." }
 */

import { NextResponse } from "next/server";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { stripeBillingAdapter } from "@/lib/billing/stripe";

export const POST = async (req: Request) => {
  try {
    // Step 1: Authenticate requesting user using authGuard session check
    const userId = await authGuard();
    console.log("[billing/portal] called", { userId });

    // Step 2: Connect to MongoDB and retrieve user document
    await connectDB();
    const user = await User.findById(userId).select("email name billingCustomerId").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 3: Determine base URL for returning after managing subscription
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000";

    // Step 4: Delegate to BillingAdapter — handles customer resolution and portal creation
    const portalParams = {
      userId,
      userEmail: user.email,
      userName: user.name,
      billingCustomerId: user.billingCustomerId,
      origin,
    };
    const result = await stripeBillingAdapter.createPortal(portalParams);

    // Step 5: Return the Customer Portal URL to front-end for redirection
    return NextResponse.json({ url: result.url });
  } catch (error: any) {
    console.error("[billing/portal] error", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
};
