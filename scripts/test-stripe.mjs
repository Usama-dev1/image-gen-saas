import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error("STRIPE_SECRET_KEY is missing in environment variables.");
  process.exit(1);
}

const stripe = new Stripe(secretKey, {
  apiVersion: '2026-07-29.dahlia',
});

async function testStripe() {
  console.log('Testing Stripe API connection...');
  try {
    const products = await stripe.products.list({ limit: 5 });
    console.log('Successfully fetched products count:', products.data.length);
    console.log('Products:', products.data.map(p => ({ id: p.id, name: p.name })));
  } catch (error) {
    console.error('Stripe API error:', error.message);
  }
}

testStripe();
