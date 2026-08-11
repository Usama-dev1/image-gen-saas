import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import stripe from "@/lib/stripe/stripe";
import { BillingView } from "./BillingView";

export async function BillingContainer() {
  const userId = await authGuard();
  await connectDB();

  const user = await User.findById(userId).select("plan credits billingSubscriptionId").lean();

  const plan = user?.plan || "free";
  const credits = user?.credits || 0;

  // Check if the active subscription is pending cancellation
  let isCancelled = false;
  if (user?.billingSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(user.billingSubscriptionId);
      isCancelled = subscription.cancel_at_period_end === true;
    } catch (error) {
      console.error("[BillingContainer] Failed to fetch subscription status", error);
    }
  }

  return <BillingView plan={plan} credits={credits} isCancelled={isCancelled} />;
}
