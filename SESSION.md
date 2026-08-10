## Planned

- See full implementation roadmap & future features in [PLAN_AND_FUTURE_FEATURES.md](file:///e:/project3/PLAN_AND_FUTURE_FEATURES.md)

## Done

- **Project Setup & Design System:** Configured Next.js router (`/`, `/dashboard`, `/dashboard/studio`, `/dashboard/batch`) and implemented a robust, DaisyUI-inspired global CSS architecture in `globals.css` (custom component classes, semantic variables, and Shadcn UI mapping).
- **Global UI Integration & Consistency:** Refactored all routes and components to rely on the unified global CSS system. Handled component conversion (replacing complex utility classes with `.card`, `.btn`, etc.), upgraded visual aesthetics (e.g., Batch Settings, Slider), and resolved conflicts like duplicate hover states or undefined sidebar colors.
- **Mobile Optimizations:** Scaled hero typography, configured responsive paddings, and enabled flex-stacking for buttons on the landing page (`/`) to ensure a polished mobile viewport experience.
- **Dashboard & Auth Refactoring:** Restructured `/dashboard`, `/dashboard/studio`, and `/dashboard/batch` to follow the Container/View pattern dictated by `AGENTS.md`. Enforced Server Component constraints and SEO metadata requirements. Implemented F14 plan step with dummy `GET /api/dashboard`. Added dummy `/login`, `/register`, and `GET/POST /api/auth/[...all]` routes.
- **Navigation Updates:** Integrated Login and Register buttons into both the desktop header (`page.tsx`) and the mobile menu (`mobile-menu.tsx`), linking to the corresponding authentication routes.
- **Authentication Flow & Session Management:** Connected Better Auth via MongoDB adapter. Tested and verified full registration and login flows.
- **Dynamic Logout Navigation:** Implemented dynamic logout actions across all navigation components (desktop nav, mobile menu, app sidebar, and mobile nav). Enhanced UI consistency with a unified `.btn-logout` global CSS class to ensure aesthetic destructiveness on hover without cluttering inline styles.
- **User Schema (F2):** Scaffolded `models/User.ts` aligning with Better Auth structure and adding `role`, `credits`, `plan` fields.
- **Admin Seeding:** Created and executed a direct database seeding script (`scripts/seed.mjs`) to create initial `admin` and `super_admin` accounts.
- **Session Architecture & TTL:** Added explicit 14-day sliding expiration in Better Auth config. Enforced auto-cleanup by creating `models/Session.ts` with a Mongoose TTL index (`expires: 0`) and imported it in `lib/db.ts` to seamlessly eliminate database bloat without external cron jobs.
- **Active Devices Prep (F26):** Installed `geoip-lite` and created `lib/geoip.ts` helper to abstract IP-to-Location logic. Injected a `create` hook into Better Auth's databaseHooks to automatically capture and append the user's City/Country into every new session document natively.
- **Edge-Level Auth Protection:** Created `src/proxy.ts` to intercept requests at the edge. It verifies the existence of the `better-auth.session_token` cookie to redirect unauthenticated users away from `/dashboard/*` and authenticated users away from auth pages, providing a fast first line of defense before the full server-side validation.
- **Session Guard (F4):** Created `src/lib/auth-guard.ts` with `authGuard()` to return the `userId` or throw an `UNAUTHORIZED` error for robust API route protection.
- **Zod Setup (F5):** Created `src/lib/validate.ts` containing the `validateBody` helper function to enforce strict input validation for incoming requests and guarantee structured 400 responses on malformed data.
- **Client-Side Validation Refactor:** Replaced heavy Zod validation in `LoginContainer.tsx` and `RegisterContainer.tsx` with lightweight regex checks. Upgraded validation UX by passing field-specific errors down to the Views to highlight inputs in red and display targeted error messages beneath them. Enforced a strict password regex (uppercase, lowercase, number, special character, 8+ chars).

- **Database Schema Overhaul (F6+):** Performed a complete audit of the data architecture against every UI route and admin feature. Redesigned all schemas to be fully provider-agnostic and BYOK-ready:
  - **Modified** `User.ts` — added `status` (active/suspended/banned), `limits` (per-user admin overrides), `apiKeys` (BYOK-ready).
  - **Overhauled** `Generation.ts` — added `source`, `modelSlug`, `settings` (flexible object), `batchId`, `characterId`, `inputImageUrl`, `negativePrompt`, `flagged`, `isDeleted` (soft delete), `errorMessage`.
  - **Created** `BatchJob.ts` — groups batch generations with progress tracking.
  - **Created** `Character.ts` — saved character identities with reference images. Zero AI-specific fields.
  - **Created** `Upload.ts` — R2 file tracking for media library, storage quotas, and cleanup.
  - **Created** `SavedPrompt.ts` — prompt templates for the Studio "Templates" button.
  - **Created** `Payment.ts` — local Stripe payment records for admin revenue metrics.
  - **Created** `ModelConfig.ts` — admin-managed model registry in MongoDB (enable/disable, pricing, capabilities, description, thumbnailUrl).
  - **Created** `AuditLog.ts` — append-only admin action log for accountability.
- **Architectural Hardening:** Conducted three extensive `/grill-me` sessions to fortify the system architecture against production edge cases. Resulted in a complete overhaul of `PLAN.md` incorporating:
  - **Credit Escrow:** Upfront deduction in `POST /api/generate` to prevent concurrency spam exploits.
  - **Abstract Adapters:** Strict TypeScript interfaces for Storage, AI Providers, and Billing to eliminate vendor lock-in.
  - **Idempotent Webhooks:** Created `WebhookEvent.ts` to block duplicate webhooks and double-billing. Mandated cryptographic signatures/secrets for AI webhooks.
  - **Non-Blocking Webhooks:** Designated Next.js `waitUntil()` for processing Replicate outputs in the background, avoiding Vercel serverless 504 timeouts.
  - **Storage Quota Enforcement:** Added `storageUsedBytes` to `User.ts` for atomic O(1) checks. Enforced quotas on both direct uploads and async generation results. Added atomic `$dec` on generation deletion.
  - **R2 Lifecycle Cleanups:** Designated a `tmp/` R2 prefix with a 24h Object Lifecycle Deletion rule to automatically scrub abandoned direct uploads and prevent storage leaks.
  - **Batch N+1 Prevention:** Added `modelSlug` and `name` to `BatchJob.ts` for clean UI rendering.
  - **BYOK Security:** Mandated `AES-256-GCM` encryption at rest for user API keys.
  - **BetterAuth Hydration:** Mandated a `getHydratedUser` helper to backfill missing Mongoose defaults for raw BetterAuth DB inserts.
- **Management Routes (Mocked):** Scaffolded all secondary dashboard routes (`/dashboard/billing`, `/dashboard/generations`, `/dashboard/characters`, `/dashboard/prompts`, `/dashboard/settings`) adhering strictly to the Server Container / Client View pattern. Integrated the standard Strict Grid layout for the Generations Library and passed mock data to all Views.
- **Studio & Batch Enhancements:** Updated Studio and Batch UIs with Character Selectors (dropdowns for `characterId` injection) and integrated a Dynamic Cost Calculation display into Batch generation. Added Prompt Template UI into Studio.
- **Navigation Completeness:** Updated desktop sidebar and mobile navigation drawer to include links to all Library and Account routes, replacing the mobile logout button with a full-screen drawer menu for better accessibility.
- **Studio Prompt Architecture & UI:** Developed the 'Save Prompt' and 'Templates' modal interfaces within the Studio route. Upgraded the `SavedPrompt.ts` schema with an `isSystemTemplate` flag and optional `userId`, enabling a unified data structure that seamlessly supports both user-specific saved prompts and globally available platform defaults (System Templates) while maintaining clean access control (RBAC). Integrated dummy data into the UI to visualize the split between 'System Templates' and 'My Prompts'.

- **Storage Adapter Migration (Cloudinary):** Designed and executed a comprehensive migration from Cloudflare R2 to Cloudinary. Authored a bulletproof `implementation_plan.md` resolving edge cases around Cloudinary's Admin API restrictions, Vercel payload/timeout limits, and storage quota exploits.
  - Installed `cloudinary` Node.js SDK and added necessary environment variables to `.env`.
  - Overhauled `Upload.ts` and `Generation.ts` to act as the ultimate source of truth, establishing an organized folder structure tied to DB schemas.
  - Engineered `StorageAdapter` interface and `CloudinaryAdapter` implementation capable of direct remote URL fetching for lightning-fast AI Generation ingestion.
  - Finalized workflows for soft deletion (user-facing, keeping storage quotas locked) and hard deletion (Admin / automated Nightly Cron Job, freeing storage quotas securely without Vercel timeouts).
- **Core Generation Infrastructure (F9-F11):** Implemented atomic credit management (`src/lib/credits.ts`) to prevent concurrency spam exploits. Built the foundational AI generation route (`POST /api/generate`) combining authentication, strict Zod validation, credit escrow, and dynamic model adapter selection. Established a robust Next.js polling architecture (`GET /api/generate/[id]/status`) that waits for Pollinations API generation, buffers the image in memory, and automatically pushes it to Cloudinary to bypass strict Vercel/Cloudinary remote URL timeouts, culminating in atomic credit refunds on failure and structured error handling. Fixed critical Mongoose/Next.js HMR Model Overwrite bugs and MongoDB `_id` type mapping discrepancies for BetterAuth users that caused false "Insufficient Credits" blocks.
- **Studio UI & Advanced Generation Features (F12-F14/F27):** Refactored `StudioView.tsx` and `StudioClientContainer.tsx` to handle state for Aspect Ratio, Quality, and Watermark toggle. Interfaced these settings tightly with the Pollinations adapter to dynamically generate dimensions (`width`/`height`) and remove watermarks natively. Integrated the 'Saved Prompts' (F27) logic entirely—creating API routes `GET/POST /api/prompts`, merging DB fetched prompts with system templates, and enabling a seamless real-time UI refresh entirely on the client without full page reloads. Built out seamless local image downloading (`URL.createObjectURL(blob)`) and native sharing (`navigator.share()`) functionalities directly above the preview canvas for immediately accessible outputs.
- **Prompts Library & Advanced Prompting (F27 cont.):** fully fleshed out the `/dashboard/prompts` library view, hooking it into the database to fetch real `SavedPrompt` models. Built a reusable, offset-based `Pagination` UI component to handle 10-item page views. Implemented full CRUD with a functional `DELETE /api/prompts/[id]` route. Plumbed URL-based cross-page navigation, allowing users to click "Use in Studio" to automatically inject the prompt and model back into the Studio tool via `URLSearchParams`. Expanded the Studio UI with an optional Negative Prompt textarea, complete with a "+ Master Negative" macro button, and wired the negative prompt all the way through the Database Schema and into the Pollinations AI Adapter payload (`&negative=`).

- **TypeScript Simplification & Code Quality Rules**: Updated global AI agent rules (`AGENTS.md`) to strictly enforce `type` aliases over `interface` preventing "type circus", and mandated the use of custom reusable hooks. Refactored the entire codebase to adhere to these rules—converting all interfaces (`storage.ts`, `ai.ts`, `button.tsx`) to `type` aliases and replacing complex `Record<string, unknown>`/`Record<string, string>` utility types with `any` across Mongoose models and Next.js container components. Verified with successful `tsc --noEmit`.

- **Enum Refactoring**: Acted on the updated global rules allowing `enum`s for fixed sets of values. Refactored the core MongoDB schemas (`User.ts`, `Generation.ts`, `BatchJob.ts`, `Payment.ts`, `Upload.ts`, `AuditLog.ts`) to extract all raw string literal unions (e.g., status, role, purpose) into formal exported TypeScript Enums (`UserRole`, `GenerationStatus`, etc.). Updated both the TypeScript definitions and the Mongoose `enum: Object.values(...)` fields to guarantee runtime/compile-time safety.

- **Character Saving & UI Gallery (F26):** Fully implemented the Character Creation flow via Next.js Server Actions. The form accepts multiple image files via a drag-and-drop `StudioImageUpload` zone, processes them into Buffers, and securely streams them directly to Cloudinary using our `CloudinaryAdapter`. The resulting URLs are saved to a new `Character` document. Upgraded the Character View Modal with a clean, zero-dependency thumbnail gallery and a fixed-height `object-contain` scaling to gracefully handle large images. Also implemented instant optimistic UI soft deletion (`isDeleted: true`), leaving the actual Cloudinary asset cleanup for a future cron job.
- **Core Generation Infrastructure II (F8-F16):** Finalized the core generation API pipeline. Implemented `POST /api/generate` to handle Zod validation, credit escrow, and generation kick-off via the Pollinations AI adapter. Added asynchronous webhook receiving (`POST /api/webhooks/ai`) to ingest provider completions, pull the image buffer, and seamlessly upload to Cloudinary while enforcing storage quotas. Built robust APIs for fetching generation history (`GET /api/generations`), reading user stats for the dashboard (`GET /api/dashboard`), and a hybrid soft/hard delete mechanism (`DELETE /api/generations/[id]`). Added robust MongoDB-backed Rate Limiting (`src/lib/rate-limit.ts`) and a standardized JSON structured logger (`src/lib/logger.ts`).

## In Progress

- **Admin Guard & Users (F17-F18):** Up next.

## Errors

## Notes

- Route structure: `/` (landing page), `/dashboard`, `/dashboard/studio`, `/dashboard/batch`
- Master Plan & Future Features stored in [PLAN_AND_FUTURE_FEATURES.md](file:///e:/project3/PLAN_AND_FUTURE_FEATURES.md)
