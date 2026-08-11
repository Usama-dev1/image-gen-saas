import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import stripe from "@/lib/stripe/stripe";
import { BillingView } from "./BillingView";
import { formatUnixDate } from "@/lib/format-date";

export async function BillingContainer() {
  const userId = await authGuard();
  await connectDB();

  const user = await User.findById(userId).select("plan credits billingCustomerId billingSubscriptionId").lean();
  if (!user) return null;

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
        
        const end = (subscription as any).current_period_end;
        if (end) {
          periodEnd = formatUnixDate(end);
        }
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
          
          const end = (activeSubscription as any).current_period_end;
          if (end) {
            periodEnd = formatUnixDate(end);
          }
        }
      }
    } catch (error: any) {
      periodEnd = `ERROR: ${error.message}`;
      console.error("[BillingContainer] Failed to fetch subscription status", error);
    }
  }

  return <BillingView plan={plan} credits={credits} isCancelled={isCancelled} periodEnd={periodEnd} />;
}
