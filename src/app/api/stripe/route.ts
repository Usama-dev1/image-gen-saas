import { NextResponse } from "next/server";
import { z } from "zod";
import stripe from "@/lib/stripe/stripe";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

const checkoutSchema = z.object({
    plan: z.enum(["pro", "max"]),
});

const PLAN_PRICE_MAP = {
    pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    max: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID,
};

export const POST = async (req: Request) => {
    try {
        // 1. Auth check
        const userId = await authGuard();

        // 2. Validate input
        const body = await req.json();
        console.log("[stripe/checkout] called", { userId, body });
        const { plan } = checkoutSchema.parse(body);

        const priceId = PLAN_PRICE_MAP[plan];
        if (!priceId) {
            return NextResponse.json({ error: "Invalid price ID configuration" }, { status: 400 });
        }

        // 3. Connect DB and check user
        await connectDB();
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 4. Determine origin URL
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

        // 5. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard?payment=cancelled`,
            client_reference_id: userId,
            customer_email: user.email,
            metadata: {
                userId,
                plan,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("[stripe/checkout] error", error);
        return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
    }
};
