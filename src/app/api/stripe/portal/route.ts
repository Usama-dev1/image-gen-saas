import { NextResponse } from "next/server";
import stripe from "@/lib/stripe/stripe";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export const POST = async (req: Request) => {
  try {
    // 1. Auth check
    const userId = await authGuard();
    console.log("[stripe/portal] called", { userId });

    // 2. Connect DB & find user
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.billingCustomerId;

    // 3. Create Stripe customer if none exists
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

      await User.findByIdAndUpdate(userId, {
        $set: { billingCustomerId: customerId },
      });
    }

    // 4. Create Stripe Customer Portal Session
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("[stripe/portal] error", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
};
