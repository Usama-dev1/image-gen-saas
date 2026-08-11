import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import stripe from "@/lib/stripe/stripe";
import { BillingView } from "./BillingView";

export async function BillingContainer() {
  const userId = await authGuard();
  await connectDB();

  const user = await User.findById(userId).select("plan credits billingCustomerId billingSubscriptionId").lean();

  const plan = user?.plan || "free";
  const credits = user?.credits || 0;

  // Check if the active subscription is pending cancellation
  let isCancelled = false;
  let periodEnd: string | null = null;
  const customerId = user?.billingCustomerId;
  const subscriptionId = user?.billingSubscriptionId;

  if (customerId || subscriptionId) {
    try {
      // 1. Try direct subscription lookup first (fastest)
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        isCancelled = subscription.cancel_at_period_end === true || subscription.canceled_at !== null;
        periodEnd = new Date((subscription as any).current_period_end * 1000).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
      } else if (customerId) {
        // 2. Fallback: list active subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });
        const activeSubscription = subscriptions.data[0];
        if (activeSubscription) {
          isCancelled = activeSubscription.cancel_at_period_end === true || activeSubscription.canceled_at !== null;
          periodEnd = new Date((activeSubscription as any).current_period_end * 1000).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
        }
      }
      console.log("[BillingContainer] Subscription check", { userId, plan, isCancelled, periodEnd, customerId, subscriptionId });
    } catch (error) {
      console.error("[BillingContainer] Failed to fetch subscription status", error);
    }
  }

  return <BillingView plan={plan} credits={credits} isCancelled={isCancelled} periodEnd={periodEnd} />;
}
