# Global Workspace Rules

## Philosophy
- Code should be readable by a beginner. If it looks clever, simplify it.
- Every file, function, and route has one job only.
- If you copy-paste more than 5 lines, it needs to be a function.
- Return early on errors, continue on success — keeps the happy path clean and flat.
- Split files by responsibility, not by size.

## TypeScript
- Keep types minimal. Use basic primitives: `string`, `number`, `boolean`, arrays.
- Use `any` whenever a type gets annoying or complex to write. Don't fight TypeScript — any is fine.
- Plain `type` aliases only. No `interface`, no `extends`, no `implements`.
- Adapters (Storage, AI Provider, Billing) are a type describing what functions they need — each provider is just a plain object with those functions. No classes, no interface.
- Ensure absolute consistency. Do not mix `type` and `interface` (the "circus of types"). Stick strictly to `type` everywhere.
- Enums are allowed for fixed sets of values (e.g. status, role, plan). Use TypeScript enum where it makes the code clearer.
- Let TypeScript infer types where obvious. Do not annotate everything manually.

## Code Structure
- Every file has one job. No utility files that grow into catch-alls.
- Extract reusable logic into custom hooks to minimize code duplication as much as possible.
- No barrel exports. Import directly from the file, not from an `index.ts`.
- No function longer than 20 lines. Split it.
- No inline object construction in function calls. Assign to a variable first.
- Every variable declared as `const` unless it must change.
- No magic numbers. Assign to a named const first: `const CREDIT_COST = 3`.

## Logic
- Keep logic straightforward. No nested conditionals, complex loops, or deep abstractions.
- No nested ternaries. Use `if/else` instead.
- No optional chaining `?.` chains longer than 2 levels. Restructure the logic.
- Prefer `async/await` over `.then()/.catch()` chains everywhere.
- Strictly follow Single Responsibility Principle: one function, one purpose.

## Naming
- Use clear, descriptive, and meaningful variable and function names.
- Name matches what it does exactly. No abbreviations.
- Container files: `GenerationContainer.tsx`
- Component files: `GenerationView.tsx` or `GenerationCard.tsx`
- Never `GenerationComponent.tsx` or `GenerationWrapper.tsx` — name what it does.
- File names must match exactly what they do: `generate-route.ts` not `utils.ts`.

## Debugging & Maintainability
- Every API route logs what it received at entry: `console.log('[route-name] called', { userId, body })`.
- Every major step inside a function gets a comment: `// 1. check credits`, `// 2. call replicate`.
- No logic inside `return` statements. Assign to a variable first, then return it.
- When a function receives an object as argument, destructure it at the top, not inline.
- Every MongoDB query result gets a null check before use. Never assume a document exists.
- When something fails, the error log must include what was being attempted, not just the error object.

## Error Handling
- Every async function has `try/catch`. No unhandled promise rejections.
- Never swallow errors silently. Always log with route name and userId.
- Return consistent error shape everywhere: `{ error: string }` with correct HTTP status.

## API Routes
- Auth check first. Always.
- Zod validation second. Before any logic runs.
- Never return raw MongoDB documents. Return plain objects only.

## Database
- Never mutate a document directly. Always use MongoDB operators: `$set`, `$inc`.
- Every query selects only the fields needed. No `.find({})` without field selection.
- Index every field you query or sort by.

## Environment & Secrets
- No hardcoded strings that belong in env vars.
- Every env var has a check at startup. Fail loud if missing.

## Git
- One commit per feature. Message matches feature name: `feat: F9 generate route`.
- Never commit with broken tests or failing smoke checks.
- No commented-out code in commits.
- No TODO comments. Either do it now or create a task.

## Component Architecture (Container / View Pattern)
- Every feature has two files: a container and a component. Never one file doing both.
- Container: fetches data, holds state, handles logic, passes props down. No JSX beyond a single return of the component.
- Component: receives props, renders UI only. No `useState`, no `useEffect`, no API calls, no logic.
- If a component has an `if` statement beyond conditional rendering, it belongs in the container.
- Props must be typed with a plain `type`. No optional props unless genuinely optional.

## Server Components First
- Every component is a Server Component by default. No `'use client'` unless absolutely required.
- `'use client'` is only allowed for: user interactions (`onClick`, `onChange`), browser APIs, `useState`, `useEffect`.
- If you add `'use client'` to a component, add a comment above it explaining exactly why.
- Never put `'use client'` on a container that fetches data — fetch on the server, pass down as props.
- Data fetching happens in Server Components only. Never in Client Components.
- Container = Server Component. Fetches data server-side, passes to dumb client component.
- Component = Client Component only if it needs interactivity. Otherwise Server Component too.
- Keep Client Components as far down the tree as possible — leaf nodes only.

## State & Data Flow
- Data flows one way only: container down to component via props.
- No prop drilling beyond 2 levels. If you need to go deeper, the component split is wrong.
- No shared global state until you absolutely cannot avoid it.

## What a Component Is Allowed
- Receive props
- Render JSX
- Call a handler passed down from the container
- Local UI state only: `isOpen`, `isHovered` — nothing business-logic related

## What a Component Is Never Allowed
- `fetch` or any API call
- `useEffect` for data fetching
- Business logic or calculations
- Knowing anything about MongoDB, credits, auth, or Stripe

## SEO Rules
- Every page has a unique `<title>` and `<meta name="description">`. No duplicates across pages.
- Use `generateMetadata()` in every `page.tsx` — never static metadata on dynamic pages.
- Every image has a meaningful `alt` tag. No empty `alt=""` unless purely decorative.
- Use semantic HTML always: `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`, `<h1>`-`<h6>` in correct order.
- One `<h1>` per page only. Never skip heading levels.
- Every page is reachable from a link. No orphan pages.
- URLs are lowercase, hyphenated, descriptive: `/ai-image-generator` not `/page1`.
- `app/sitemap.ts` includes every public page.
- `app/robots.ts` blocks `/dashboard`, `/admin`, `/api` routes from indexing.

## Performance for SEO
- No client-side data fetching for content search engines need to index — always server-side.
- Images use `next/image` always. Never a raw `<img>` tag.
- Fonts loaded via `next/font` only. Never a `<link>` to Google Fonts.
- No layout shift — every image and container has explicit dimensions.

## Structured Data
- Add JSON-LD schema to key pages: homepage, pricing, blog posts if any.
- Use `SoftwareApplication` schema on the homepage.
- Use `FAQPage` schema on pricing or landing pages.

## Agent Behavior & Permissions
- NEVER make unsolicited changes. Do exactly as told, and no more.
- ALWAYS ask for explicit permission before doing multi-file edits or implementing broad changes.

## App Architecture & Integrations
- **MongoDB First**: MongoDB is the absolute source of truth. Never rely on third-party Admin APIs to query state.
- **Provider-Agnostic**: Models (`Generation`, `Payment`) are provider-agnostic.
- **Database Hooks**: Use Better Auth `databaseHooks` for hydrating users upon creation instead of manual hydration.
- **Storage Adapter Pattern**: All storage goes through `StorageAdapter` (Cloudinary). Soft delete instantly in DB (`isDeleted: true`); cron jobs handle bulk hard deletes to Cloudinary.
- **AI Generation (Fire-and-Forget)**: AI generation deducts credits upfront, kicks off the job asynchronously, and returns a pending status instantly. A webhook commits the final image.
- **Zod Everywhere**: Every API route must use Zod to validate payloads before logic runs.
- **Test Scripts Before Integration**: Before wiring any major API (Cloudinary, Replicate), ALWAYS write a standalone test script in `scripts/` first.

## Data Fetching & UI
- **Server Actions for Mutations**: Client components trigger mutations (saves, updates) using Next.js Server Actions.
- **Native Fetch Polling**: Use native `fetch()` loops in custom hooks for polling AI status. Avoid heavy clients like React Query.
- **Tailwind First**: All styling must use Tailwind CSS. Prioritize modern, premium aesthetics (glassmorphism, subtle gradients).
- **Error Boundaries**: Wrap major routes in React Error Boundaries to prevent full page crashes.