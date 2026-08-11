/**
 * Billing Adapter Type Definition
 *
 * Provider-agnostic billing adapter following the same plain-object pattern
 * as StorageAdapter and AIProviderAdapter.
 * Each billing provider (Stripe, LemonSqueezy, etc.) implements this type.
 */

// Normalized webhook event types — every provider maps to these
export enum BillingWebhookEvent {
  SUBSCRIPTION_CREATED = "SUBSCRIPTION_CREATED",
  PAYMENT_SUCCEEDED = "PAYMENT_SUCCEEDED",
  SUBSCRIPTION_CANCELED = "SUBSCRIPTION_CANCELED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
}

// Normalized result returned by handleWebhook — route uses this for DB mutations
export type WebhookResult = {
  eventType: BillingWebhookEvent;
  eventId: string;
  userId: string;
  plan: string;
  creditsToGrant: number;
  planExpiresAt: Date | null;
  amountPaid: number;
  currency: string;
  providerSessionId: string;
  customerId: string | null;
  subscriptionId: string | null;
};

export type CheckoutParams = {
  userId: string;
  userEmail: string;
  plan: "pro" | "max" | "refill";
  billingCustomerId?: string;
  billingSubscriptionId?: string;
  currentPlan?: string;
  origin: string;
};

export type PortalParams = {
  userId: string;
  userEmail: string;
  userName?: string;
  billingCustomerId?: string;
  origin: string;
};

export type BillingAdapter = {
  /**
   * Creates a hosted checkout session for subscription or one-time purchase.
   * Returns a URL for the client to redirect the user to.
   */
  createCheckout(params: CheckoutParams): Promise<{ url: string }>;

  /**
   * Creates a customer portal session for managing subscriptions.
   * Returns a URL for the client to redirect the user to.
   */
  createPortal(params: PortalParams): Promise<{ url: string }>;

  /**
   * Verifies the webhook signature, parses the raw event, and normalizes
   * it into a WebhookResult. Returns null for unhandled event types.
   */
  handleWebhook(rawBody: string, signature: string): Promise<WebhookResult | null>;
};
