## F1 — Database Connection ✅
- `lib/db.ts` — Mongoose connect with dev hot-reload caching
- **Test:** `readyState === 1` on first route hit

## F2 — User Schema & Hydration ✅
- `models/User.ts` — `email`, `name`, `image`, `role`, `status`, `credits`, `storageUsedBytes`, `plan`, `planExpiresAt`, `limits`, `billingSubscriptionId`, `billingCustomerId`, `apiKeys`
- *Hydration handled natively via Better Auth `databaseHooks` upon user creation!*

## F3 — Better Auth ✅
- MongoDB adapter on existing Mongoose connection — no second connection
- Google  + email+password only
- `GET|POST /api/auth/[...all]`
- **Test:** sign in with Google → User doc created in MongoDB with correct fields

## F4 — Session Guard ✅
- `lib/auth-guard.ts` — returns `userId` or throws 401
- **Test:** unauthenticated → 401

## F5 — Zod Setup ✅
- `lib/validate.ts` — shared helper, used on every route from here forward
- **Test:** malformed body to any route → structured 400

## F6 — Database Schema Architecture ✅
Full provider-agnostic schema overhaul. 11 models total:

- `models/Generation.ts` — `userId`, `prompt`, `negativePrompt`, `status`, `source`, `outputUrl`, `inputImageUrl`, `characterId`, `batchId`, `providerJobId`, `modelSlug`, `settings`, `creditCost`, `errorMessage`, `flagged`, `isDeleted`
- `models/BatchJob.ts` — `userId`, `name`, `modelSlug`, `status`, `totalCount`, `completedCount`, `failedCount`
- `models/Character.ts` — `userId`, `name`, `avatarUrl`, `referenceUrls[]`, `description`
- `models/Upload.ts` — `userId`, `url`, `key`, `fileName`, `fileSize`, `contentType`, `purpose`
- `models/SavedPrompt.ts` — `userId`, `title`, `modelSlug`, `prompt`, `negativePrompt`, `settings`
- `models/Payment.ts` — `userId`, `providerSessionId`, `provider`, `amount`, `currency`, `plan`, `creditsAdded`, `status`
- `models/WebhookEvent.ts` — `eventId` (unique), `provider`, `type`
- `models/ModelConfig.ts` — `slug`, `label`, `description`, `thumbnailUrl`, `provider`, `enabled`, `creditCost`, `supportsByok`, `capabilities`, `sortOrder`
- `models/AuditLog.ts` — `adminId`, `action`, `targetType`, `targetId`, `details`

## F7 — Storage Adapter & Cloudinary ✅
- `lib/adapters/storage.ts` — `StorageAdapter` interface (`uploadFile`, `deleteFile`)
- `lib/storage/cloudinary.ts` — implements interface
- MongoDB is the absolute source of truth. The Cloudinary Admin API is strictly forbidden.
- Server-side only uploads: Frontend enforces 4MB limit to bypass Vercel serverless payload limits. AI Generation URLs are sent directly to Cloudinary for ingestion.
- `uploadFile(buffer | url, options)` → uploads to Cloudinary, returns metadata.
- **Rollback**: If MongoDB `Upload` save fails, rollback with `cloudinary.uploader.destroy()`.
- **Soft Deletion**: Users soft-delete via MongoDB (`isDeleted: true`). Storage quota (`storageUsedBytes`) is **not** refunded upon soft deletion to prevent abuse.
- **Hard Deletion**: Nightly Vercel Cron Job hits `/api/cron/empty-trash` to chunk `destroy()` calls, avoiding Vercel timeouts and Admin API limits, and refunds storage quotas.
- Env: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Test:** upload test buffer → commits successfully to Cloudinary and MongoDB. Admin trash UI chunks hard deletes.

## F8 — AI Provider Adapter & Replicate (testing using Pollinations.ai to access not direct access)
- `lib/adapters/ai.ts` — `AIProviderAdapter` interface (`startGeneration`, `checkStatus`)
- `lib/ai/replicate.ts` — implements interface
- `startGeneration(modelSlug, prompt, settings)` → `{ providerJobId }`
- Supports platform keys and BYOK. **BYOK keys MUST be stored encrypted at rest (AES-256-GCM) via a master `.env` key, and decrypted only in-memory.**
- Env: provider-specific keys (`OPENAI_API_KEY`, `REPLICATE_API_TOKEN`, etc.)
- **Test:** hardcoded prompt → provider job ID returned

## F9 — Async Generate Route (Fire-and-Forget)
- `POST /api/generate` — auth → validate → check `user.limits` & **enforce storage quota** → **deduct credits upfront (escrow)** → create Generation doc (`pending`).
- Wrap `AIProviderAdapter.startGeneration()` in a `try/catch`. If it fails synchronously (e.g. invalid API key), **immediately refund credits** and return 500. Otherwise, save `providerJobId` to doc → return `{ generationId, status: 'pending' }` instantly.
- **Test:** POST with prompt → returns instantly with pending state, credits deducted upfront. Synchronous failure immediately refunds.

## F10 — Status Polling & Webhook Background Execution
- `GET /api/generate/[id]/status` → checks AI provider.
- `POST /api/webhooks/ai` → Webhook endpoint. **Must verify cryptographic signature or use shared secret (`?secret=xyz`)** to prevent spoofed refunds. Uses Next.js `waitUntil()` to immediately return `200 OK`.
- In background: First, check if `Generation` is already `failed` or `succeeded`. If so, **no-op** (prevents double-refunds from race conditions).
- If not terminal, fetch output buffer → `StorageAdapter.commitUpload()` → update Generation doc (`succeeded`, `outputUrl`).
- If `failed`: update Generation doc (`failed`) → **automatically refund `creditCost` to user**.
- **Test:** poll mid-generation → `pending`. Poll after fail → refunded. Terminal jobs ignore duplicate webhooks.

## F11 — Credit Service
- `lib/credits.ts` — `checkCredits(userId, amount)`, `deductCredits(userId, amount)`, `refundCredits(userId, amount)` atomic operations.
- Respects `user.limits.maxCredits` and plan defaults.
- **Test:** credits 5 → deduct(3) → 2 remaining. Refund(3) → 5.

## F12 — Generation History
- `GET /api/generations` — `userId` filter, `isDeleted: false`, cursor pagination `?cursor=<lastId>&limit=20`, `createdAt` desc
- **Test:** 3 generations → all 3 returned in correct order

## F13 — Hybrid Delete Generation & Zombie Sweep
- `DELETE /api/generations/[id]` — verify ownership → soft delete DB (`isDeleted: true`) → call `StorageAdapter.delete()` for hard file deletion → **atomically `$dec` User `storageUsedBytes`**.
- **Cron Sweep**: Find jobs `pending`/`processing` > 60m → mark `failed` → trigger credit refund.
- **Test:** delete generation → file gone from R2, storage quota decremented, DB kept for analytics. Sweep clears stuck jobs.

## F14 — Dashboard Route
- `GET /api/dashboard` → `{ credits, storageUsedBytes, plan, planExpiresAt, recentGenerations[], characterCount, savedPromptCount }`
- **Test:** correctly shaped response returned

## F15 — Rate Limiting
- `lib/rate-limit.ts` — sliding window, MongoDB-backed
- Respects `user.limits.maxGenerationsPerDay` and plan defaults
- Apply to `/api/generate` only
- **Test:** exceed daily limit → rate limit error returned

## F16 — Structured Logging
- `lib/logger.ts` — `{ timestamp, route, userId, error }`
- Replace all `console.error` across all routes
- **Test:** trigger any error → structured log in console

---

**Core generation pipeline done. Now admin + billing.**

---

## F17 — Admin Guard
- `lib/admin-guard.ts` — checks `role === "admin"`, throws 403 otherwise
- **Test:** non-admin hits admin route → 403

## F18 — Admin User Management
- `GET /api/admin/users?search=email&status=active` — paginated user list
- `GET /api/admin/users/[id]` — full details + stats (generations, credits, storage)
- `PATCH /api/admin/users/[id]/credits` — `{ delta: number }` → logs to `AuditLog`
- `PATCH /api/admin/users/[id]/status` — `{ status: "banned" }` → logs to `AuditLog`
- `PATCH /api/admin/users/[id]/limits` — `{ maxGenerationsPerDay: 50 }` → logs to `AuditLog`
- **Test:** search user → found. Ban user → status updated. Adjust credits → DB updated. Logged.

## F19 — Admin Metrics & Model Management
- `GET /api/admin/metrics` → `{ totalUsers, totalGenerations, totalRevenue, activeModels, failedRate }`
- `GET /api/admin/models` → list models from `ModelConfig` + live health
- `PATCH /api/admin/models/[slug]` → enable/disable, change pricing → logs to `AuditLog`
- `GET /api/admin/audit-log` → paginated history
- **Test:** routes return counts. Disable model → `enabled: false`. Audit log populated.

## F20 — SEO & Metadata
- Base metadata `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`
- **Test:** page source → meta tags present

---

**Admin done. Now billing.**

---

## F21 — Billing Adapter & Provider Setup
- `lib/adapters/billing.ts` — `BillingAdapter` interface (`createCheckout`, `createPortal`, `handleWebhook`)
- `lib/billing/stripe.ts` — implements interface
- `config/plans.ts` — plan names → IDs + credit amounts + default limits
- Env: Provider secret keys and webhook secrets
- **Test:** import → no error

## F22 — Checkout & Portal Routes
- `POST /api/billing/checkout` → calls `BillingAdapter.createCheckout()` → `{ url }`
- `POST /api/billing/portal` → calls `BillingAdapter.createPortal()` → `{ url }`
- **Test:** call routes → correct provider URLs returned

## F23 — Full Lifecycle Provider-Agnostic Webhooks
- `POST /api/webhooks/billing` — passes raw body to `BillingAdapter.handleWebhook()`
- Normalizes into:
  - `SUBSCRIPTION_CREATED`: Updates `plan`, `planExpiresAt`, grants credits.
  - `PAYMENT_SUCCEEDED`: Grants monthly credits, extends `planExpiresAt`, creates `Payment` doc.
  - `SUBSCRIPTION_CANCELED`: Reverts to `free` plan immediately.
  - `PAYMENT_FAILED`: Logs failure.
- Uses `WebhookEvent` model to enforce idempotency (rejects duplicate event IDs).
- **Test:** webhook retry → blocked by idempotency. Subscription deleted → plan downgraded.

## F24 — Env Audit & Launch
- All secrets in platform env vars, zero in code
- Webhook endpoints registered
- Full journey: sign in → buy plan → generate → downgrade plan → delete
- **Test:** end-to-end in live mode

## F25 — Active Devices Security Dashboard
- Use `geoip-lite` to derive location from IP.
- UI component in `/dashboard/settings` to list active sessions
- Action to remotely revoke individual sessions via Better Auth API
- **Test:** Login from two devices, view them in dashboard, revoke one.

---

## F26 — Character CRUD
- **Next.js Server Actions (`src/actions/characters.ts`)** handling the full CRUD instead of API routes.
- **Create**: Accepts `FormData`, extracts `File[]`, processes them into `Buffer`s, and uses `CloudinaryAdapter` to stream them directly to Cloudinary. Saves URLs to `Character` model.
- **Read**: Listed in `/dashboard/characters` (Server Component). Displays empty/locked slot logic based on `user.limits`.
- **Soft Delete**: Sets `isDeleted: true` instantly for a snappy UI. 
- **Hard Delete (Cron - TODO)**: Requires a background cron job implementation to find soft-deleted characters, delete their files from Cloudinary via Admin API, and permanently remove the DB records.
- **Test:** full CRUD cycle works, Storage tracked

## F27 — Saved Prompts CRUD
- `POST /api/prompts` — save prompt template
- `GET /api/prompts` — list user's saved prompts
- `DELETE /api/prompts/[id]` — delete prompt
- **Test:** save → list → delete cycle works

## F28 — Batch Generation Route
- `POST /api/batch` — auth → validate (**Strict Zod limit: max 50 items per batch to prevent serverless timeouts**) → deduct credits upfront for N tasks → create `BatchJob` doc → create N async `Generation` docs linked via `batchId` → call AI Provider Adapter N times.
- `GET /api/batch/[id]/status` → calls `AIProviderAdapter.checkStatus()` on pending jobs. Updates `BatchJob.completedCount`/`failedCount`. Auto-refunds failed jobs.
- **Test:** submit batch of 3 → all 3 succeed → BatchJob status `completed`. Submit 51 → 400 Bad Request.

## F29 — Generation Library Page
- `/dashboard/generations` — full paginated history with filters (source, status, model)
- Wire up sidebar "Generations" link
- **Test:** page loads with paginated grid, filters work

---

## F30 — Comprehensive Abuse & Security Assessment
- Conduct a full platform audit specifically focused on abuse vectors before launch.
- Implement strict, layered rate limiting across all mutating endpoints (not just generation).
- Audit all DB queries for potential DoS vulnerabilities (e.g., missing `.limit()` or pagination on user-generated content).
- Implement strict access control (RBAC) on all administrative or systemic features.
- Build monitoring and automatic suspension triggers for accounts exhibiting abusive patterns.
- **Test:** Run simulated abuse scripts (spamming save buttons, concurrent webhooks, bypassing client validations) to verify edge-level and server-level defenses.

---

Route shape every time:

```
try {
  // 1. auth guard (check status !== banned)
  // 2. zod validate
  // 3. check limits (user.limits → plan defaults)
  // 4. business logic
  // 5. return { data }
} catch (err) {
  logger.error('[route-name]', err)
  return NextResponse.json({ error: 'message' }, { status: 500 })
}
```
