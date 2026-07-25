## F1 — Database Connection
- `lib/db.ts` — Mongoose connect with dev hot-reload caching
- **Test:** `readyState === 1` on first route hit

## F2 — User Schema
- `models/User.ts` — `email`, `name`, `image`, `role`, `credits`, `plan`, `planExpiresAt`, `createdAt`
- **Test:** schema review only

## F3 — Better Auth
- MongoDB adapter on existing Mongoose connection — no second connection
- Google  + email+password only
- `GET|POST /api/auth/[...all]`
- **Test:** sign in with Google → User doc created in MongoDB with correct fields

## F4 — Session Guard
- `lib/auth-guard.ts` — returns `userId` or throws 401
- **Test:** unauthenticated → 401

## F5 — Zod Setup
- `lib/validate.ts` — shared helper, used on every route from here forward
- **Test:** malformed body to any route → structured 400

## F6 — Generation Schema
- `models/Generation.ts` — `userId`, `type`, `status`, `prompt`, `outputUrl`, `provider`, `creditCost`, `createdAt`
- **Test:** schema review only

## F7 — Cloudflare R2
- `lib/r2.ts` — S3Client pointed at R2 using `@aws-sdk/client-s3`
- `uploadToR2(buffer, key, contentType)` → public URL
- `deleteFromR2(key)`
- Env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- **Test:** upload test buffer → R2 public URL returned

## F8 — Replicate Integration
- `lib/replicate.ts` — direct API calls, no wrapping
- `runPrediction(prompt, model)` → `{ id, outputUrl }`
- Env: `REPLICATE_API_TOKEN`
- **Test:** hardcoded prompt → prediction ID + output URL returned

## F9 — Generate Route
- `POST /api/generate` — auth → validate → create Generation doc (`pending`) → call Replicate → fetch output buffer → upload to R2 → update doc (`succeeded`, `outputUrl`) → deduct credits → return `{ generationId }`
- **Test:** POST with prompt → doc goes `pending → succeeded`, `outputUrl` on R2

## F10 — Status Polling Route
- `GET /api/generate/[id]/status` → `{ status, outputUrl }`
- **Test:** poll mid-generation → `pending`. After → `succeeded` + R2 URL

## F11 — Credit Service
- `lib/credits.ts` — `checkCredits(userId, amount)` + `deductCredits(userId, amount)` atomic `findOneAndUpdate`
- Wire into F9: check before → deduct after success only
- **Test:** credits 5 → generate (cost 3) → 2 remaining. Credits 0 → 402

## F12 — Generation History
- `GET /api/generations` — `userId` filter, cursor pagination `?cursor=<lastId>&limit=20`, `createdAt` desc
- **Test:** 3 generations → all 3 returned in correct order

## F13 — Delete Generation
- `DELETE /api/generations/[id]` — verify ownership → R2 delete first → MongoDB delete
- **Test:** delete → gone from both MongoDB and R2

## F14 — Dashboard Route
- `GET /api/dashboard` → `{ credits, plan, planExpiresAt, recentGenerations[] }`
- **Test:** correctly shaped response returned

## F15 — Rate Limiting
- `lib/rate-limit.ts` — sliding window, MongoDB-backed
- Apply to `/api/generate` only
- **Test:** 10 rapid requests → rate limit error returned

## F16 — Structured Logging
- `lib/logger.ts` — `{ timestamp, route, userId, error }`
- Replace all `console.error` across all routes
- **Test:** trigger any error → structured log in console

## F17 — Admin Guard
- `lib/admin-guard.ts` — checks `role === "admin"`, throws 403 otherwise
- **Test:** non-admin hits admin route → 403

## F18 — Admin User Management
- `GET /api/admin/users?search=email` — paginated user list
- `PATCH /api/admin/users/[id]/credits` — `{ delta: number }` positive or negative
- **Test:** search user → found. Adjust credits → MongoDB updated

## F19 — Admin Metrics
- `GET /api/admin/metrics` → `{ totalUsers, totalGenerations, totalCreditsUsed }` via MongoDB aggregation
- **Test:** call route → correct counts returned

## F20 — SEO & Metadata
- Base metadata `app/layout.tsx`
- `app/sitemap.ts` + `app/robots.ts`
- Dynamic `generateMetadata()` on key pages
- **Test:** page source → meta tags present

---

**Core product done. Now billing.**

---

## F21 — Stripe Setup
- `lib/stripe.ts` — server-side Stripe instance
- `config/plans.ts` — plan names → Price IDs + credit amounts, plain object
- Env: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Test:** import → no error

## F22 — Checkout Route
- `POST /api/billing/checkout` → Checkout session with `userId` in metadata → `{ url }`
- **Test:** call → URL opens Stripe hosted page

## F23 — Stripe Webhook
- `POST /api/webhooks/stripe` — verify signature first (fail fast) → `checkout.session.completed` → update `plan`, `planExpiresAt`, increment `credits`
- Log every unhandled event type
- **Test:** Stripe CLI → complete test checkout → MongoDB user updated

## F24 — Billing Portal
- `POST /api/billing/portal` → `{ url }`
- **Test:** call → Stripe portal opens for that customer

## F25 — Env Audit & Launch
- All secrets in platform env vars, zero in code
- Stripe live keys + webhook endpoint registered
- Full journey: sign in → buy plan → generate → history → delete
- **Test:** end-to-end in live mode

## F26 — Active Devices Security Dashboard
- Use `geoip-lite` to natively derive geographic location strictly from the user's IP address, completely independent of hosting providers.
- UI component in `/dashboard/settings` to list active sessions mapped to devices/locations
- Action to remotely revoke individual sessions via Better Auth API
- **Test:** Login from two devices, view them in dashboard, and revoke one successfully.

---

Route shape every time:

```
try {
  // 1. auth guard
  // 2. zod validate
  // 3. business logic
  // 4. return { data }
} catch (err) {
  logger.error('[route-name]', err)
  return NextResponse.json({ error: 'message' }, { status: 500 })
}
```

Start F1.