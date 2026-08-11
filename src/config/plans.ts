/**
 * Centralized Plan Configuration
 *
 * Maps plan names to their Stripe Price IDs, credit grants, and labels.
 * Single source of truth for plan definitions used across checkout routes,
 * webhooks, and UI components.
 */

// Subscription plan config — recurring monthly billing
export const SUBSCRIPTION_PLANS: Record<string, { stripePriceId: string; credits: number; label: string }> = {
  pro: {
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    credits: 500,
    label: "Pro",
  },
  max: {
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID!,
    credits: 2000,
    label: "Max",
  },
};

// One-time credit refill config
export const REFILL_CONFIG = {
  credits: 500,
  priceInCents: 1000, // $10.00 USD
  label: "500 Extra Credits Refill",
  description: "One-time purchase of 500 AI image generation credits",
};

// Default credits granted when plan is unknown (fallback)
export const DEFAULT_PLAN_CREDITS = 500;
