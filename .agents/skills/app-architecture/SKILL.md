---
name: architecture_reference
description: Comprehensive reference for the architecture, design patterns, and best practices used in the Imgsaas Next.js application. Use this for building similar AI SaaS apps.
---

# App Architecture & Best Practices Reference

This document outlines the core architecture, design patterns, and best practices implemented in this application. It serves as a blueprint for building scalable AI SaaS applications.

## 1. Database & State (The Absolute Source of Truth)
- **MongoDB First:** MongoDB is the absolute source of truth for everything. We NEVER rely on third-party Admin APIs (like Cloudinary or Stripe) to query state, file counts, or generation status in real-time.
- **Provider-Agnostic Models:** Models like `Generation`, `Payment`, and `Upload` are completely agnostic to the underlying provider. A generation can come from Replicate or OpenAI, but it maps to the exact same schema.
- **Database Hooks for Hydration:** Instead of manually "hydrating" user documents with default credits/limits when they log in, we use Better Auth's native `databaseHooks` (`user.create.before`). This intercepts the social sign-up and injects `credits`, `limits`, and `storageUsedBytes` directly into the database the millisecond the user is created.

## 2. UI & Component Architecture
- **Server Components Default:** Every component is a Server Component by default. `'use client'` is strictly reserved for leaf nodes that require interactivity (e.g., `onClick`, `useState`).
- **Container / View Pattern:**
  - **Container (`*Container.tsx`):** A Server Component that fetches data, handles business logic, and passes state down as simple props. No complex UI.
  - **Component (`*View.tsx` or `*Card.tsx`):** A purely visual component. It receives data via props and renders the UI. It never fetches data or knows about the database.
- **Strict Single Responsibility:** Every file and function has exactly one job. No catch-all `utils.ts` files or giant 500-line components.
- **No Barrel Exports:** We import directly from the specific file, completely avoiding `index.ts` barrel files to keep bundling clean and explicit.
- **Custom Hooks:** We aggressively extract reusable frontend logic (like form handling, API polling, or complex state) into custom React hooks. This keeps views strictly focused on rendering UI.

## 3. Storage Flow (Cloudinary)
- **Adapter Pattern:** All storage interactions go through a `StorageAdapter` type — a plain object of functions, not a class or interface. This allows swapping Cloudinary for AWS S3 later without changing business logic.
- **Webhook to Storage:** When the AI provider finishes a generation, it sends a webhook with a temporary image URL. Our backend passes this URL to the `StorageAdapter`, which commands Cloudinary to fetch and save the image permanently.
- **Soft vs Hard Deletion:** 
  - User deletes image -> We immediately mark `isDeleted: true` in MongoDB (Soft Delete) for instant UI feedback.
  - A nightly Cron job finds all soft-deleted records and triggers bulk API deletes to Cloudinary (Hard Delete). This prevents Vercel serverless timeouts during user actions.

## 4. AI Generation Flow (Fire-and-Forget)
- **Synchronous Catch, Asynchronous Execution:** The `/api/generate` route handles auth, validates via Zod, deducts credits upfront (escrow), and kicks off the AI job. 
- **Instant Return:** The route immediately returns a `providerJobId` and a `pending` status. It does *not* wait for the image to finish generating.
- **Webhook Resolution:** The AI provider sends a webhook when complete. The webhook endpoint verifies the signature, commits the final image via the Storage Adapter, and updates the MongoDB Generation status to `succeeded` or `failed`. If failed, credits are automatically refunded.

## 5. Security & Validation
- **Zod Everywhere:** Every API route uses Zod to strictly validate incoming JSON payloads before any logic runs.
- **Auth Guarding:** Routes are protected by a shared `authGuard()` helper that guarantees a valid `userId` or immediately throws a 401.
- **Rate Limiting:** Sliding-window rate limiting is enforced on mutating endpoints to prevent abuse.

## 6. Logic & Maintainability
- **Early Returns:** Functions return early on errors. The "happy path" is completely flat, avoiding deeply nested `if/else` statements.
- **No Magic Numbers:** All constants (e.g., credit costs) are extracted to named variables.
- **Structured Error Logging:** Raw `console.log` is replaced with structured logging (`{ timestamp, route, userId, error }`) to easily trace errors in production logs.
- **Scalability & Maintenance:** We write code assuming the platform will scale significantly. We avoid shared global state unless unavoidable, avoid deeply nested loops/conditionals, and rigidly enforce "One File, One Job" to ensure the codebase remains maintainable and clean as it grows.
- **Simplicity First (Beginner-Friendly):** Code must be readable by developers at a beginner or intermediate level. Strictly avoid overly clever code, complex abstractions, or deeply nested multi-loops. If logic feels complex, simplify it.
- **Small Files & Helpers:** Files should never grow into massive walls of code. If a file becomes too long, aggressively extract logic into standalone functions inside a `helpers/` folder.
- **Explicit Commenting:** Every file and major function must include clear, plain-English comments explaining exactly what it does and how the logic works under the hood.

## 7. Testing & Iteration
- **Test Scripts Before Integration:** Before wiring any major API integration (e.g., Cloudinary, Replicate, Better Auth) into the core application routes, we **ALWAYS** write a standalone test script in the `scripts/` folder (e.g., `scripts/test-cloudinary.ts`). 
- **Validation:** This practice isolates the logic, ensures environment variables and credentials are correct, and validates the raw API response before introducing Next.js routing or UI complexity.

## 8. Design System & UI Aesthetics
- **Tailwind CSS First:** All styling is driven by Tailwind CSS to ensure a consistent, utility-first approach across the entire application without messy external stylesheets.
- **Modern & Premium Aesthetics:** The design system prioritizes a rich, modern feel (e.g., dark modes, glassmorphism, subtle gradients, and micro-animations) to wow the user.
- **Component Reusability:** The UI structure relies heavily on small, composable UI components (e.g., Shadcn UI or similar Tailwind libraries) to maintain visual consistency and reduce duplicated Tailwind classes.

## 9. Data Fetching & Mutations
- **Server Actions for Mutations:** Client components should primarily trigger mutations (e.g., saving settings, updating profiles) using Next.js Server Actions, keeping API layer complexity minimal.
- **Native Fetch Polling:** For continuous state checks (like polling AI generation status), we rely on native `fetch()` loops wrapped cleanly inside custom React hooks (e.g., `useGenerationPolling`). We avoid heavy client-side caching libraries like React Query unless strictly necessary.

## 10. SEO & Semantic HTML
- **Dynamic Metadata:** Every page must export a `generateMetadata()` function to ensure unique titles and descriptions. Never use static metadata for dynamic routes.
- **Strict Semantic HTML:** Pages must follow strict semantic hierarchy. There must be exactly one `<h1>` tag per page, followed sequentially by `<h2>`, `<h3>`, etc. Always use `<main>`, `<section>`, and `<article>` tags where appropriate.
- **Structured Data:** Use JSON-LD (`SoftwareApplication`, `FAQPage`, etc.) injected directly into the HTML for key landing, pricing, and content pages to maximize search engine visibility.

## 11. Observability, Analytics & Stability
- **Client-Side Error Boundaries:** Every major route and interactive section must be wrapped in a React Error Boundary. When a component crashes, it should gracefully fall back without taking down the entire page.
- **Telemetry & Analytics:** The platform integrates Vercel Analytics and structural event tracking for deep insights into user behavior and generation flows, ensuring product decisions are data-driven.
- **Backend Logging:** As mentioned in logic best practices, all backend exceptions must be logged structurally to feed cleanly into monitoring platforms (like Datadog or Sentry).

## 12. Minimal TypeScript
- **Bare Minimum Typing:** The author has a beginner level of TypeScript knowledge. We strictly use TypeScript in its simplest form just to prevent basic runtime errors.
- **No Complex Types:** Absolutely NO complex generics, utility types (like `Omit`, `Pick`, `ReturnType`), or deeply nested interfaces. 
- **Basic Primitives Only:** Stick to `string`, `number`, `boolean`, and simple arrays. If a type becomes too difficult or annoying to declare, confidently use `any` rather than wasting time on type gymnastics. Avoid TypeScript entirely where it isn't strictly necessary.
- **Enums are allowed for fixed sets of values (e.g. status, role, plan) — no need to force these into string constants.**
