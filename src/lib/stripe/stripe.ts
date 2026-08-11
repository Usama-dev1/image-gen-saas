/**
 * Stripe SDK Initialization Module
 * 
 * Purpose:
 * Initializes and exports a singleton instance of the Stripe Node.js SDK
 * using the secret key from environment variables.
 * 
 * Environment Variables Used:
 * - STRIPE_SECRET_KEY: Secret key provided by Stripe Dashboard (sk_test_... or sk_live_...)
 */

import Stripe from "stripe";

// 1. Fetch secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// 2. Validate that secret key exists at boot time; fail loud if missing
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment variables.");
}

// 3. Initialize Stripe client instance configured with locked API version
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-07-29.dahlia",
});

// 4. Default export for convenience across application imports
export default stripe;