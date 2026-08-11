/**
 * Stripe Customer Portal API Route
 * 
 * Endpoint URL:
 * - Production: POST https://image-gen-saas-pi.vercel.app/api/stripe/portal
 * - Development: POST http://localhost:3000/api/stripe/portal
 * 
 * Purpose:
 * Creates a Stripe Customer Portal Session for authenticated users to manage,
 * update, or cancel their active subscriptions and view payment invoices.
 * 
 * Request Payload:
 * None (Authenticated via session cookie/header)
 * 
 * Response Payload (JSON):
 * { "url": "https://billing.stripe.com/p/session/test_..." }
 */

import { NextResponse } from "next/server";
import stripe from "@/lib/stripe/stripe";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export const POST = async (req: Request) => {
  try {
    // Step 1: Authenticate requesting user using authGuard session check
    const userId = await authGuard();
    console.log("[stripe/portal] called", { userId });

    // Step 2: Connect to MongoDB database and retrieve user document
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.billingCustomerId;

    // Step 3: Ensure user has a valid Stripe Customer ID; create one if missing
    if (!customerId) {
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: { userId },
        });
        customerId = newCustomer.id;
      }

      // Save newly assigned billingCustomerId to user document in MongoDB
      await User.findByIdAndUpdate(userId, {
        $set: { billingCustomerId: customerId },
      });
    }

    // Step 4: Determine base URL for returning after managing subscription
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000";

    // Step 5: Call Stripe Billing Portal API to generate portal session link
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    // Step 6: Return the Customer Portal URL to front-end for redirection
    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("[stripe/portal] error", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
};
