# Codebase Review — Consistent AI

## Overall Rating: **7.5 / 10**

Solid foundation with clean architecture patterns. The adapter pattern, container/view split, and server action usage are all well thought out. The issues below are fixable without major rewrites.

---

## ✅ What's Done Well

| Area | Details |
|------|---------|
| **Adapter Pattern** | `AIProviderAdapter` and `StorageAdapter` types make swapping providers trivial |
| **Container/View Split** | Dashboard, Studio, Login, Register all follow the pattern correctly |
| **Atomic Credit Deduction** | `deductCredits` uses `$gte` + `$inc` in a single atomic query — no race conditions |
| **Soft Deletes** | Generations and Characters use `isDeleted` flag — good for undo + batch cleanup later |
| **Auth Guard** | Clean `authGuard()` helper reused across all server actions |
| **Zod Validation** | Properly used in server actions before any logic runs |
| **SEO** | `robots.ts`, `sitemap.ts`, `generateMetadata()`, JSON-LD ready |
| **Session TTL** | Smart use of MongoDB TTL index on Session model for auto-cleanup |

---

## 🔴 Critical Issues

### 1. Dead Code: `src/actions/auth.ts` is unused
The `loginAction` server action I created earlier is no longer used — login was reverted to client-side `signIn.email`. This file is dead weight and imports `auth` server-side for nothing.

**Fix:** Delete `src/actions/auth.ts` entirely.

---

### 2. Dual MongoDB Connections — Potential Connection Leak
Two separate MongoDB connections exist:

- `src/lib/auth.ts`: `new MongoClient(...)` (raw driver for Better Auth)
- `src/lib/db.ts`: `mongoose.connect(...)` (Mongoose for app models)

Every server action calls `connectDB()` which creates Mongoose connections, while Better Auth maintains its own pool. In production under load, you'll hit MongoDB's connection limit (especially on shared Atlas clusters which cap at 500).

**Fix:** Use a singleton pattern for both, and consider sharing the underlying connection.

---

### 3. `connectDB()` Called on Every Request — No Connection Caching
`src/lib/db.ts` calls `mongoose.connect()` on every single request. Mongoose internally handles reconnection, but the `console.log("MongoDB Connected Successfully")` fires every time (as your terminal shows), suggesting it's reconnecting frequently.

**Fix:** Cache the connection promise.

---

### 4. Pollinations Adapter Fakes Async — Always Returns "succeeded" Instantly
`src/lib/ai/pollinations.ts` `checkStatus()` always returns `succeeded` immediately because Pollinations.ai generates images synchronously via URL. The "polling" in `useStudioForm.ts` will always resolve on the first poll.

This isn't a bug per se, but the polling architecture (designed for truly async providers like Replicate) is doing unnecessary work here. When you switch to Replicate, this will actually matter.

**Risk:** If you forget to implement real polling for Replicate, jobs will appear stuck forever.

---

### 5. `proxy.ts` Is Not Wired as Middleware
`src/proxy.ts` exports `proxy()` and `config`, but Next.js middleware must be in `src/middleware.ts` (or root `middleware.ts`). This file is likely not being used as middleware at all — the auth redirects you see are from the `layout.tsx` server-side checks instead.

**Fix:** Rename to `middleware.ts` or import `proxy` from a proper `middleware.ts`.

---

## 🟡 Scalability Concerns

### 6. No Pagination on Generations List
`src/actions/generations.ts` supports cursor-based pagination, which is great. But verify the frontend actually uses it — if it loads all generations at once, this will break with 1000+ records.

### 7. `useStudioForm` Hook is 208 Lines — Violates 20-Line Rule
`src/hooks/useStudioForm.ts` manages 15+ state variables and 3 major async flows in one hook. Per your rules, no function should exceed 20 lines.

**Fix:** Split into focused hooks:
- `useStudioGeneration` — handles generate + polling
- `useStudioSave` — handles save prompt + save character
- `useStudioUpload` — handles reference image uploads

### 8. No Rate Limiting on Generation
`startGenerationAction` checks credits but has no rate limit. A user with 1000 credits could fire 1000 concurrent generations instantly, hammering your AI provider and Cloudinary.

**Fix:** Add a `maxGenerationsPerDay` check using the `limits` field already on your User model.

### 9. Status Polling Route Has No Max Retry
`src/hooks/useStudioForm.ts` polls `/api/generate/:id/status` every 2 seconds with `setInterval` but has **no maximum retry count**. If a generation gets stuck in "processing" forever, the client polls indefinitely.

**Fix:** Add a max poll count (e.g., 60 polls = 2 minutes) then show a timeout error.

---

## 🟡 Logic Issues

### 10. `deleteGenerationAction` — Double Query
`src/actions/delete-generation.ts` does `findOne` then `updateOne` — two queries for what should be one.

### 11. `updatePromptAction` — No Zod Validation on Update Input
`src/actions/prompts.ts` accepts `Partial<SavePromptInput>` but doesn't validate it with Zod. A malicious client could send `{ credits: 9999 }` and it would be passed directly to `$set`.

**Fix:** Validate update input with a partial Zod schema.

### 12. Upload Action Leaks `apiKey` to Client
`src/actions/upload.ts` returns `apiKey` to the client for signed uploads. This is standard Cloudinary practice (the signature is what protects you), but the `apiKey` is still semi-sensitive. Just worth noting.

### 13. Debug `console.log` Left in Production Code
`src/app/dashboard/DashboardContainer.tsx` has `console.log("DEBUG: ...")` that should be removed before production.

---

## 🟢 Minor / Cleanup

| # | File | Issue |
|---|------|-------|
| 14 | `src/lib/credits.ts` | Uses deprecated `{ new: true }` — Mongoose warns to use `returnDocument: 'after'` |
| 15 | `src/lib/storage/cloudinary.ts` | Uses callback-based Cloudinary API wrapped in Promises. Cloudinary v2 supports `await` natively |
| 16 | `src/app/register/RegisterContainer.tsx` | Same client-side pattern as old login — will have the same CORS issue if accessed from network IP |
| 17 | `src/app/robots.ts` | Doesn't block `/api` routes from indexing (your AGENTS.md rule requires it) |
| 18 | `src/lib/utils.ts` | Has `cn()` + `downloadImage()` — two unrelated things. Per rules, every file has one job |

---

## Summary

| Category | Score |
|----------|-------|
| Architecture & Patterns | 9/10 |
| Security | 6/10 |
| Scalability | 6/10 |
| Code Quality / Rules Compliance | 7/10 |
| Logic Correctness | 8/10 |
| **Overall** | **7.5/10** |

The foundation is genuinely strong. The adapter pattern, atomic credit ops, and container/view split show thoughtful architecture. The main risks are the dual DB connections under load, missing rate limits, and the few validation gaps. All fixable without restructuring.

---

## 🛠️ Improvements — How To Fix Everything

Fixes are ordered by priority. Each includes the exact code change needed.

---

### Fix #1 — Delete Dead `actions/auth.ts`

**Issue:** #1 — File is unused, wastes bundle size, confusing to future devs.

**Action:** Delete `src/actions/auth.ts` entirely. It was created for a server action login approach that was reverted.

---

### Fix #2 — Cache MongoDB Connection (Stop "MongoDB Connected" Spam)

**Issue:** #2, #3 — `connectDB()` reconnects on every request. Dual connections waste pool slots.

**Replace `src/lib/db.ts` with:**

```typescript
import mongoose from "mongoose";
import "../models/Session"; // Ensure TTL index is registered on boot

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = () => {
  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI || "";
    connectionPromise = mongoose.connect(uri).then((m) => {
      console.log("MongoDB Connected Successfully");
      return m;
    });
  }
  return connectionPromise;
};

export default connectDB;
```

**Why:** The connection is created once and the promise is reused on every subsequent call. No more reconnecting per request, no more log spam. If the connection drops, Mongoose auto-reconnects internally.

---

### Fix #3 — Wire `proxy.ts` as Proper Middleware

**Issue:** #5 — `proxy.ts` exists but isn't actually being used as Next.js middleware.

**Create `src/middleware.ts`:**

```typescript
import { proxy, config } from "./proxy";

export { config };
export default proxy;
```

Or simply **rename** `src/proxy.ts` → `src/middleware.ts` and change the export:

```typescript
// ... keep existing code ...

// Change this:
export function proxy(request: NextRequest) {

// To this:
export default function middleware(request: NextRequest) {
```

**Why:** Next.js only picks up middleware from `middleware.ts` at the root of `src/` (or project root). Without this, the auth redirect logic only works because your `layout.tsx` and `page.tsx` files duplicate the session check server-side. The middleware approach is faster (runs at the edge, before rendering starts).

---

### Fix #4 — Validate `updatePromptAction` Input with Zod

**Issue:** #11 — Raw `Partial<SavePromptInput>` goes straight to `$set` with no validation.

**Replace the update function in `src/actions/prompts.ts` with:**

```typescript
const updatePromptSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  prompt: z.string().min(1).max(2000).optional(),
  negativePrompt: z.string().optional(),
  modelSlug: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export async function updatePromptAction(id: string, input: unknown) {
  let userId: string;
  try {
    userId = await authGuard();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  if (!id) {
    return { error: "Prompt ID is required" };
  }

  // Validate — blocks injection of fields like { credits: 9999 }
  const parsed = updatePromptSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await connectDB();

    const updatedPrompt = await SavedPrompt.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed.data },
      { returnDocument: "after" }
    );

    if (!updatedPrompt) {
      return { error: "Prompt not found or unauthorized" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[updatePromptAction]", err, userId);
    return { error: "Failed to update prompt" };
  }
}
```

**Why:** Without this, any key/value pair sent by the client gets written directly to MongoDB. A crafted request could overwrite `userId`, `_id`, or any other field.

---

### Fix #5 — Add Rate Limiting to Generation

**Issue:** #8 — No rate limit. User can spam 1000 generations instantly.

**Add this check to `src/actions/generate.ts` before credit deduction:**

```typescript
// Check daily generation limit
await connectDB();
const user = await User.findById(userId).select("limits").lean();
const dailyLimit = user?.limits?.maxGenerationsPerDay || 50;

const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const todayCount = await Generation.countDocuments({
  userId,
  createdAt: { $gte: todayStart },
});

if (todayCount >= dailyLimit) {
  return { error: `Daily generation limit reached (${dailyLimit}). Try again tomorrow.` };
}
```

**Why:** The `limits.maxGenerationsPerDay` field already exists on your User model. This just enforces it. Without it, a single user can exhaust your AI provider quota.

---

### Fix #6 — Add Max Poll Count to Prevent Infinite Polling

**Issue:** #9 — `setInterval` polls forever if a generation gets stuck.

**Update the polling block in `src/hooks/useStudioForm.ts`:**

```typescript
// 2. Poll for Status
const MAX_POLL_ATTEMPTS = 60; // 60 * 2s = 2 minute timeout
let pollCount = 0;

const pollInterval = setInterval(async () => {
  pollCount++;

  if (pollCount >= MAX_POLL_ATTEMPTS) {
    clearInterval(pollInterval);
    setIsGenerating(false);
    setGenerationError("Generation timed out. Please try again.");
    if (uploadedPublicIds.length > 0) deleteTempImagesAction(uploadedPublicIds);
    return;
  }

  try {
    const statusRes = await fetch(`/api/generate/${generationId}/status`);
    const statusData = await statusRes.json();

    if (statusData.status === "succeeded") {
      clearInterval(pollInterval);
      setGeneratedImageUrl(statusData.outputUrl);
      setIsGenerating(false);
      if (uploadedPublicIds.length > 0) deleteTempImagesAction(uploadedPublicIds);
    } else if (statusData.status === "failed") {
      clearInterval(pollInterval);
      setIsGenerating(false);
      setGenerationError(`Generation failed: ${statusData.errorMessage || 'Unknown error'}`);
      if (uploadedPublicIds.length > 0) deleteTempImagesAction(uploadedPublicIds);
    }
  } catch (pollError) {
    console.error("Polling error:", pollError);
    clearInterval(pollInterval);
    setIsGenerating(false);
    setGenerationError("Lost connection while checking status.");
  }
}, 2000);
```

---

### Fix #7 — Collapse `deleteGenerationAction` to Single Query

**Issue:** #10 — Two queries when one is sufficient.

**Replace `src/actions/delete-generation.ts` with:**

```typescript
"use server";

import connectDB from "@/lib/db";
import { Generation } from "@/models/Generation";
import { authGuard } from "@/lib/auth-guard";

export async function deleteGenerationAction(id: string) {
  try {
    const userId = await authGuard();
    await connectDB();

    const result = await Generation.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isDeleted: true } }
    );

    if (!result) {
      return { error: "Generation not found" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[deleteGenerationAction] failed", { id, error });
    return { error: error.message || "Failed to delete generation" };
  }
}
```

---

### Fix #8 — Fix Deprecated Mongoose `{ new: true }`

**Issue:** #14 — Mongoose warns about deprecated `new` option.

**Find every instance of `{ new: true }` and replace with `{ returnDocument: "after" }`.**

Files affected:
- `src/lib/credits.ts` line 32
- `src/actions/prompts.ts` line 105

---

### Fix #9 — Remove Debug Logs

**Issue:** #13 — Debug console.logs will show in production server logs.

**Delete these lines from `src/app/dashboard/DashboardContainer.tsx`:**

```diff
-  console.log("DEBUG: DashboardContainer userId:", userId);
-  console.log("DEBUG: DashboardContainer rawGenerations count:", rawGenerations.length);
```

---

### Fix #10 — Block `/api` Routes in `robots.ts`

**Issue:** #17 — Per your AGENTS.md rules, `/api` routes should not be indexed.

**Update `src/app/robots.ts`:**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: "https://consistentai.app/sitemap.xml",
  };
}
```

---

### Fix #11 — Split `utils.ts` (One File, One Job)

**Issue:** #18 — `cn()` and `downloadImage()` are unrelated utilities in the same file.

**Keep `src/lib/utils.ts` with only `cn()`.**

**Move `downloadImage` to `src/lib/download.ts`:**

```typescript
export async function downloadImage(imageUrl: string, filename?: string) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `image-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Failed to download image", err);
    window.open(imageUrl, "_blank");
  }
}
```

Update all imports from `@/lib/utils` → `@/lib/download` for `downloadImage`.

---

### Fix #12 — Split `useStudioForm` into Focused Hooks

**Issue:** #7 — 208-line hook managing 15+ state vars violates the 20-line function rule.

**Split into 3 hooks:**

| New Hook | Responsibility | State it owns |
|----------|---------------|---------------|
| `useStudioGeneration` | `handleGenerate`, polling, generation state | `isGenerating`, `generatedImageUrl`, `generationError` |
| `useStudioSave` | `handleConfirmSave`, `handleConfirmSaveChar` | `isSaveModalOpen`, `promptName`, `isSaveCharModalOpen`, `charName`, `charDesc` |
| `useStudioUpload` | Upload signature, reference file management | `referenceFiles` |

The parent `useStudioForm` becomes a thin coordinator that composes these three hooks and returns the combined interface. Each sub-hook stays under 20 lines per function.

---

### Fix #13 — Modernize Cloudinary Adapter (Callbacks → Async/Await)

**Issue:** #15 — Wrapping callbacks in `new Promise()` is unnecessary with Cloudinary v2.

**Replace `src/lib/storage/cloudinary.ts` upload with:**

```typescript
uploadFile: async (file: Buffer | string, options: UploadOptions): Promise<UploadResult> => {
  const uploadOptions = {
    folder: options.folder,
    resource_type: options.resourceType || "auto" as const,
    format: options.format,
  };

  const result = Buffer.isBuffer(file)
    ? await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) =>
          err ? reject(err) : resolve(res)
        );
        stream.end(file);
      })
    : await cloudinary.uploader.upload(file, uploadOptions);

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    resourceType: result.resource_type,
  };
},
```

> Note: The Buffer stream upload still needs a Promise wrapper because Cloudinary's `upload_stream` is callback-only. But the URL string upload can use `await` directly.

---

## Priority Order

If you want to tackle these in order of impact:

| Priority | Fix | Impact | Effort |
|----------|-----|--------|--------|
| 🔴 P0 | #1 Delete dead auth.ts | Removes confusion | 10 seconds |
| 🔴 P0 | #9 Remove debug logs | Prevents leaking info in prod | 10 seconds |
| 🔴 P0 | #4 Zod on updatePrompt | Closes injection vulnerability | 5 minutes |
| 🟠 P1 | #2 Cache DB connection | Stops connection churn | 5 minutes |
| 🟠 P1 | #3 Wire middleware | Auth redirects at edge, faster | 5 minutes |
| 🟠 P1 | #5 Rate limit generation | Prevents abuse | 10 minutes |
| 🟡 P2 | #6 Max poll count | Prevents infinite polling | 5 minutes |
| 🟡 P2 | #7 Single query delete | Performance micro-optimization | 2 minutes |
| 🟡 P2 | #8 Fix deprecated Mongoose | Silences warnings | 2 minutes |
| 🟡 P2 | #10 Block /api in robots | SEO compliance | 1 minute |
| 🟢 P3 | #11 Split utils.ts | Code hygiene | 5 minutes |
| 🟢 P3 | #12 Split useStudioForm | Rules compliance, maintainability | 30 minutes |
| 🟢 P3 | #13 Modernize Cloudinary | Code cleanliness | 10 minutes |
