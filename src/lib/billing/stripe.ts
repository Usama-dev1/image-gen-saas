/**
 * Stripe Billing Adapter Implementation
 *
 * Implements the BillingAdapter type using the Stripe SDK.
 * Handles checkout session creation (subscriptions + one-time refills),
 * customer portal session creation, and webhook event normalization.
 *
 * All Stripe-specific logic lives here — route handlers stay thin.
 */

import type { BillingAdapter, CheckoutParams, PortalParams, WebhookResult } from "@/lib/adapters/billing";
import { BillingWebhookEvent } from "@/lib/adapters/billing";
import Stripe from "stripe";
import stripe from "@/lib/stripe/stripe";
import { SUBSCRIPTION_PLANS, REFILL_CONFIG } from "@/config/plans";
import { User } from "@/models/User";

// Credit mapping dictionary based on subscribed plan
const PLAN_CREDITS_MAP: Record<string, number> = {
  pro: SUBSCRIPTION_PLANS.pro.credits,
  max: SUBSCRIPTION_PLANS.max.credits,
};

// Default credits for unknown plans (fallback)
const DEFAULT_CREDITS = 500;

/**
 * Builds Stripe line items for a checkout session.
 * Subscriptions use configured price IDs; refills use inline price_data.
 */
function buildLineItems(plan: "pro" | "max" | "refill") {
  const isRefill = plan === "refill";

  if (isRefill) {
    const refillLineItem = {
      price_data: {
        currency: "usd",
        product_data: {
          name: REFILL_CONFIG.label,
          description: REFILL_CONFIG.description,
        },
        unit_amount: REFILL_CONFIG.priceInCents,
      },
      quantity: 1,
    };
    return [refillLineItem];
  }

  // Subscription plan
  const planConfig = SUBSCRIPTION_PLANS[plan];
  if (!planConfig || !planConfig.stripePriceId) {
    throw new Error(`Invalid price ID configuration for plan: ${plan}. Check environment variables.`);
  }

  const subscriptionLineItem = { price: planConfig.stripePriceId, quantity: 1 };
  return [subscriptionLineItem];
}

/**
 * Checks if the user's current subscription is actively cancelled.
 * Returns true if the subscription is pending cancellation at period end.
 */
async function isSubscriptionCancelled(billingSubscriptionId?: string, billingCustomerId?: string): Promise<boolean> {
  // 1. Try direct subscription lookup first (fastest path)
  if (billingSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(billingSubscriptionId);
    const isCancelled = subscription.cancel_at_period_end === true || subscription.canceled_at !== null;
    return isCancelled;
  }

  // 2. Fallback: list active subscriptions for this customer
  if (billingCustomerId) {
    const subscriptions = await stripe.subscriptions.list({
      customer: billingCustomerId,
      status: "active",
      limit: 1,
    });
    const activeSubscription = subscriptions.data[0];
    if (activeSubscription) {
      const isCancelled = activeSubscription.cancel_at_period_end === true || activeSubscription.canceled_at !== null;
      return isCancelled;
    }
  }

  return false;
}

/**
 * Resolves or creates a Stripe Customer ID for the user.
 * Checks existing customer by email before creating a new one.
 * Saves the billingCustomerId to MongoDB if newly created.
 */
async function resolveCustomerId(userId: string, userEmail: string, userName?: string, existingCustomerId?: string): Promise<string> {
  // 1. Return existing customer ID if available
  if (existingCustomerId) {
    return existingCustomerId;
  }

  // 2. Check if a Stripe customer already exists with this email
  const existingCustomers = await stripe.customers.list({
    email: userEmail,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    const foundCustomerId = existingCustomers.data[0].id;

    // Save to MongoDB so we don't need to look up again
    await User.findByIdAndUpdate(userId, {
      $set: { billingCustomerId: foundCustomerId },
    });

    return foundCustomerId;
  }

  // 3. Create a new Stripe customer
  const newCustomer = await stripe.customers.create({
    email: userEmail,
    name: userName || undefined,
    metadata: { userId },
  });

  // Save newly assigned billingCustomerId to user document in MongoDB
  await User.findByIdAndUpdate(userId, {
    $set: { billingCustomerId: newCustomer.id },
  });

  return newCustomer.id;
}

/**
 * Extracts planExpiresAt from a Stripe subscription object.
 * Retrieves the subscription if only an ID is available from the session.
 */
async function extractPlanExpiresAt(subscriptionIdOrNull: string | null): Promise<Date | null> {
  if (!subscriptionIdOrNull) {
    return null;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionIdOrNull);
  const periodEnd = subscription.items.data[0]?.current_period_end;
  if (!periodEnd) return null;
  // Stripe returns Unix timestamp in seconds — convert to Date
  const expiresAt = new Date(periodEnd * 1000);
  return expiresAt;
}

/**
 * Normalizes a Stripe checkout.session.completed event into a WebhookResult.
 * Handles both subscription checkouts and one-time credit refills.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, eventId: string): Promise<WebhookResult | null> {
  const userId = session.metadata?.userId || session.client_reference_id;
  const plan = session.metadata?.plan || "pro";
  const isRefill = plan === "refill" || session.metadata?.type === "one_time_refill" || session.mode === "payment";

  if (!userId) {
    return null;
  }

  const creditsToGrant = isRefill ? REFILL_CONFIG.credits : (PLAN_CREDITS_MAP[plan] || DEFAULT_CREDITS);
  const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
  const customerId = typeof session.customer === "string" ? session.customer : null;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

  // Extract planExpiresAt from the subscription's current_period_end
  const planExpiresAt = isRefill ? null : await extractPlanExpiresAt(subscriptionId);

  const eventType = isRefill ? BillingWebhookEvent.PAYMENT_SUCCEEDED : BillingWebhookEvent.SUBSCRIPTION_CREATED;

  const result: WebhookResult = {
    eventType,
    eventId,
    userId,
    plan: isRefill ? "refill" : plan,
    creditsToGrant,
    planExpiresAt,
    amountPaid,
    currency: session.currency || "usd",
    providerSessionId: session.id,
    customerId,
    subscriptionId,
  };

  return result;
}

/**
 * Normalizes a Stripe invoice.payment_succeeded event into a WebhookResult.
 * Fires each billing cycle for recurring subscriptions — grants monthly credits.
 */
function handleInvoiceSucceeded(invoice: Stripe.Invoice, eventId: string): WebhookResult | null {
  // Skip the very first invoice — that's already handled by checkout.session.completed
  const billingReason = invoice.billing_reason;
  if (billingReason === "subscription_create") {
    return null;
  }

  const subscriptionIdRaw = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof subscriptionIdRaw === "string" ? subscriptionIdRaw : null;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;

  // Extract userId from subscription metadata
  const userId = invoice.parent?.subscription_details?.metadata?.userId || null;
  if (!userId) {
    return null;
  }

  // Determine plan from the invoice line items price ID
  const priceRaw = invoice.lines?.data?.[0]?.pricing?.price_details?.price;
  const priceId = typeof priceRaw === "string" ? priceRaw : (priceRaw as Stripe.Price)?.id;
  let plan = "free";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    plan = "pro";
  } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID) {
    plan = "max";
  }

  const creditsToGrant = PLAN_CREDITS_MAP[plan] || DEFAULT_CREDITS;
  const amountPaid = invoice.amount_paid ? invoice.amount_paid / 100 : 0;

  // Extract planExpiresAt from the invoice's period_end
  const periodEnd = invoice.lines?.data?.[0]?.period?.end;
  const planExpiresAt = periodEnd ? new Date(periodEnd * 1000) : null;

  const result: WebhookResult = {
    eventType: BillingWebhookEvent.PAYMENT_SUCCEEDED,
    eventId,
    userId,
    plan,
    creditsToGrant,
    planExpiresAt,
    amountPaid,
    currency: invoice.currency || "usd",
    providerSessionId: invoice.id,
    customerId,
    subscriptionId,
  };

  return result;
}

/**
 * Normalizes a Stripe customer.subscription.deleted event into a WebhookResult.
 * Fires when a subscription is fully canceled (end of period or immediate).
 */
function handleSubscriptionDeleted(subscription: Stripe.Subscription, eventId: string): WebhookResult | null {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : null;

  if (!customerId) {
    return null;
  }

  // userId will be resolved by the route via billingCustomerId lookup
  const result: WebhookResult = {
    eventType: BillingWebhookEvent.SUBSCRIPTION_CANCELED,
    eventId,
    userId: "", // Route resolves via customerId lookup
    plan: "free",
    creditsToGrant: 0,
    planExpiresAt: null,
    amountPaid: 0,
    currency: "usd",
    providerSessionId: subscription.id,
    customerId,
    subscriptionId: null,
  };

  return result;
}

/**
 * Normalizes a Stripe invoice.payment_failed event into a WebhookResult.
 * Used for logging failed payment attempts.
 */
function handlePaymentFailed(invoice: Stripe.Invoice, eventId: string): WebhookResult | null {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
  const subscriptionIdRaw = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof subscriptionIdRaw === "string" ? subscriptionIdRaw : null;
  const userId = invoice.parent?.subscription_details?.metadata?.userId || "";

  const result: WebhookResult = {
    eventType: BillingWebhookEvent.PAYMENT_FAILED,
    eventId,
    userId,
    plan: "",
    creditsToGrant: 0,
    planExpiresAt: null,
    amountPaid: 0,
    currency: invoice.currency || "usd",
    providerSessionId: invoice.id,
    customerId,
    subscriptionId,
  };

  return result;
}

// Stripe implementation of BillingAdapter
export const stripeBillingAdapter: BillingAdapter = {
  async createCheckout(params: CheckoutParams) {
    const { userId, userEmail, plan, billingCustomerId, billingSubscriptionId, currentPlan, origin } = params;
    const isRefill = plan === "refill";

    // 1. Block duplicate subscription for the same active plan (refills always allowed)
    // Allow re-subscribing if the current subscription is cancelled (pending end)
    if (!isRefill && currentPlan === plan) {
      const isCancelled = await isSubscriptionCancelled(billingSubscriptionId, billingCustomerId);
      if (!isCancelled) {
        throw new Error("You are already subscribed to this plan.");
      }
    }

    // 2. Build line items based on plan type
    const lineItems = buildLineItems(plan);

    // 3. Construct Stripe Checkout Session payload
    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: isRefill ? "payment" : "subscription",
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
        type: isRefill ? "one_time_refill" : "subscription",
      },
    };

    // 4. Pass userId into subscription_data.metadata so invoice.payment_succeeded can read it
    if (!isRefill) {
      sessionPayload.subscription_data = {
        metadata: { userId },
      };
    }

    // 5. Reuse existing Stripe customer ID if available to avoid duplicate customer records
    if (billingCustomerId) {
      sessionPayload.customer = billingCustomerId;
    } else {
      sessionPayload.customer_email = userEmail;
    }

    // 6. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionPayload);

    if (!session.url) {
      throw new Error("Stripe returned a session without a checkout URL.");
    }

    return { url: session.url };
  },

  async createPortal(params: PortalParams) {
    const { userId, userEmail, userName, billingCustomerId, origin } = params;

    // 1. Resolve or create a Stripe Customer ID
    const customerId = await resolveCustomerId(userId, userEmail, userName, billingCustomerId);

    // 2. Create the Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return { url: portalSession.url };
  },

  async handleWebhook(rawBody: string, signature: string): Promise<WebhookResult | null> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is missing in environment variables.");
    }

    // 1. Verify cryptographic signature
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // 2. Route to the correct handler based on event type
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return await handleCheckoutCompleted(session, event.id);
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        return handleInvoiceSucceeded(invoice, event.id);
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        return handleSubscriptionDeleted(subscription, event.id);
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        return handlePaymentFailed(invoice, event.id);
      }

      default:
        // Unhandled event type — return null so route skips gracefully
        return null;
    }
  },
};


