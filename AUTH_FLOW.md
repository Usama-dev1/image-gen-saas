# Better Auth — Complete Auth Flow Reference

> This document covers every auth pattern used in this project: email/password, Google OAuth, session management, route protection, and Vercel deployment.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  auth-client.ts ─── createAuthClient() ──► signIn / signUp      │
│       │                                     signOut / useSession │
│       │                                                         │
│       │  All client calls hit ──► /api/auth/*                   │
└───────┼─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     proxy.ts (Next.js Proxy)                     │
│                                                                 │
│  Runs BEFORE every matched route. Checks session cookie.        │
│  • No cookie + /dashboard/* ──► redirect /login                 │
│  • Has cookie + /login or /register ──► redirect /dashboard     │
└───────┼─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   api/auth/[...all]/route.ts                     │
│                                                                 │
│  toNextJsHandler(auth) ──► Better Auth handles ALL endpoints:   │
│                                                                 │
│  POST /api/auth/sign-up/email     ← register                   │
│  POST /api/auth/sign-in/email     ← login                      │
│  POST /api/auth/sign-out          ← logout                     │
│  GET  /api/auth/get-session       ← current session             │
│  GET  /api/auth/sign-in/social?provider=google ← OAuth start    │
│  GET  /api/auth/callback/google   ← OAuth callback              │
│  GET  /api/auth/ok                ← health check                │
└───────┼─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB (Database)                        │
│                                                                 │
│  Collections managed by Better Auth:                            │
│  • user      ─ accounts with role, credits, plan, etc.          │
│  • session   ─ active sessions with token, expiry, location     │
│  • account   ─ linked OAuth providers (Google, GitHub)          │
│  • verification ─ email verification tokens                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Map

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Server-side Better Auth config (secret, DB, hooks, providers) |
| `src/lib/auth-client.ts` | Client-side auth helpers (signIn, signUp, signOut, useSession) |
| `src/lib/auth-guard.ts` | Server action helper — throws if no session |
| `src/proxy.ts` | Next.js 16 Proxy — cookie-based route protection |
| `src/app/api/auth/[...all]/route.ts` | Catch-all route that delegates to Better Auth |
| `src/app/login/LoginContainer.tsx` | Client Component — email + Google login |
| `src/app/register/RegisterContainer.tsx` | Client Component — email + Google register |
| `src/app/dashboard/layout.tsx` | Server Component — server-side session check + redirect |
| `src/lib/user.ts` | Default fields injected into new users via databaseHooks |
| `src/lib/geoip.ts` | Derives location from IP for session records |

---

## 1. Server Config — `src/lib/auth.ts`

This is the single source of truth for all auth behavior.

```typescript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,

  // Resolves to Vercel URL in production, localhost in dev
  baseURL: process.env.BETTER_AUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),

  trustedOrigins: [
    "http://localhost:3000",
    "https://your-app.vercel.app",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],

  plugins: [nextCookies()],       // Required for Next.js cookie handling
  database: mongodbAdapter(db),    // Raw MongoClient, NOT Mongoose

  emailAndPassword: { enabled: true },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    // To add GitHub:
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 14,  // 14 days
    updateAge: 60 * 60 * 24,        // Refresh DB record once per day
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { ...user, role: "user", credits: 10, plan: "free" }
        })
      }
    }
  },
});
```

### Key Points

- **`nextCookies()` plugin** — required for Better Auth to read/write cookies through Next.js
- **`mongodbAdapter`** — uses raw `MongoClient`, NOT Mongoose (Better Auth manages its own collections)
- **`databaseHooks.user.create.before`** — injects default fields (credits, role, plan) into every new user at creation time, eliminating a separate "hydration" step
- **`baseURL`** — must match your production domain on Vercel

---

## 2. Client Setup — `src/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
```

- No `baseURL` needed when client and server share the same domain
- The client auto-discovers `/api/auth/*` endpoints
- `useSession()` is a React hook for client components
- `signIn`, `signUp`, `signOut` are async functions for mutations

---

## 3. API Route — `src/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

This single catch-all route handles ALL Better Auth endpoints automatically:

### Email/Password Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/sign-up/email` | Register new user with `{ name, email, password }` |
| `POST` | `/api/auth/sign-in/email` | Login with `{ email, password }` |
| `POST` | `/api/auth/sign-out` | Logout — clears session cookie |
| `GET`  | `/api/auth/get-session` | Returns current session + user or `null` |
| `GET`  | `/api/auth/ok` | Health check — returns `{ ok: true }` |

### OAuth Routes (Google, GitHub)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET`  | `/api/auth/sign-in/social?provider=google` | Start Google OAuth flow |
| `GET`  | `/api/auth/callback/google` | Google redirects here after consent |
| `GET`  | `/api/auth/sign-in/social?provider=github` | Start GitHub OAuth flow |
| `GET`  | `/api/auth/callback/github` | GitHub redirects here after consent |

### JWT / Token Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/token` | Exchange session for a JWT (if JWT plugin enabled) |
| `GET`  | `/api/auth/jwks` | Public JWKS endpoint for token verification |

> **Note:** JWT is not enabled by default. Better Auth uses cookie-based sessions. To add JWT support, install the `jwt` plugin.

---

## 4. Route Protection — `src/proxy.ts`

Next.js 16 renamed `middleware.ts` to `proxy.ts`. The exported function must be named `proxy`.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "better-auth.session_token";
const SECURE_COOKIE_NAME = `__Secure-${COOKIE_NAME}`;

function hasSessionCookie(request: NextRequest) {
  const secureCookie = request.cookies.get(SECURE_COOKIE_NAME);
  const normalCookie = request.cookies.get(COOKIE_NAME);
  return !!(secureCookie?.value || normalCookie?.value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = hasSessionCookie(request);

  // Unauthenticated → redirect away from protected routes
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated → redirect away from auth pages
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
```

### ⚠️ Critical: The `__Secure-` Cookie Prefix

In production (HTTPS), Better Auth automatically prefixes cookies:

| Environment | Cookie Name |
|---|---|
| `localhost` (HTTP) | `better-auth.session_token` |
| Vercel/Production (HTTPS) | `__Secure-better-auth.session_token` |

**You MUST check for both.** If you only check the non-prefixed name, production will have an infinite redirect loop because the cookie is never found.

---

## 5. Server-Side Session Check — Dashboard Layout

The proxy only checks for cookie **existence** (fast, no DB call). For actual session **validation**, use `auth.api.getSession()` in Server Components:

```typescript
// src/app/dashboard/layout.tsx (Server Component)
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <div>{children}</div>;
}
```

---

## 6. Auth Guard for Server Actions — `src/lib/auth-guard.ts`

Every server action that needs authentication uses this helper:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function authGuard(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}
```

Usage in a server action:

```typescript
"use server";

export async function deleteGenerationAction(id: string) {
  const userId = await authGuard(); // throws if not logged in
  // ... proceed with userId
}
```

---

## 7. Login Flow (Email/Password)

```
User fills form → LoginContainer.tsx
       │
       ▼
signIn.email({ email, password })
       │
       ▼
POST /api/auth/sign-in/email
       │
       ├── ❌ Wrong credentials → { error: "Invalid email or password" }
       │
       └── ✅ Success → Set-Cookie: better-auth.session_token=xxx
                │
                ▼
        window.location.href = "/dashboard"
                │
                ▼
        proxy.ts checks cookie → found → allows through
                │
                ▼
        dashboard/layout.tsx → auth.api.getSession() → valid → render
```

---

## 8. Register Flow (Email/Password)

```
User fills form → RegisterContainer.tsx
       │
       ▼
signUp.email({ name, email, password })
       │
       ▼
POST /api/auth/sign-up/email
       │
       ├── databaseHooks.user.create.before runs
       │   └── Injects: role="user", credits=10, plan="free"
       │
       ├── databaseHooks.session.create.before runs
       │   └── Injects: location from IP via geoip
       │
       ├── ❌ Email exists → { error: "User already exists" }
       │
       └── ✅ Success → Set-Cookie + auto-login
                │
                ▼
        window.location.href = "/dashboard"
```

---

## 9. Google OAuth Flow

```
User clicks "Google" → LoginContainer.tsx
       │
       ▼
signIn.social({ provider: "google", callbackURL: "/dashboard" })
       │
       ▼
GET /api/auth/sign-in/social?provider=google
       │
       ▼
302 Redirect → Google Consent Screen
       │
       ▼
User approves → Google redirects to:
GET /api/auth/callback/google?code=xxx
       │
       ├── Better Auth exchanges code for user info
       ├── Creates user if new (databaseHooks run)
       ├── Creates session
       ├── Sets cookie
       │
       └── 302 Redirect → /dashboard (callbackURL)
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Set Authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
4. Also add `http://localhost:3000/api/auth/callback/google` for local dev
5. Set env vars:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

## 10. Adding GitHub OAuth

### Step 1: Add provider to `src/lib/auth.ts`

```typescript
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  },
},
```

### Step 2: Add button in LoginContainer / RegisterContainer

```typescript
const handleGithubLogin = async () => {
  await signIn.social({
    provider: "github",
    callbackURL: "/dashboard",
  });
};
```

### Step 3: GitHub App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set callback URL: `https://your-app.vercel.app/api/auth/callback/github`
4. Set env vars:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

No route changes needed — the `[...all]` catch-all handles `/api/auth/callback/github` automatically.

---

## 11. Sign Out

```typescript
import { signOut } from "@/lib/auth-client";

const handleSignOut = async () => {
  await signOut();
  window.location.href = "/login";
};
```

This calls `POST /api/auth/sign-out` which:
1. Deletes the session from MongoDB
2. Clears the session cookie
3. Client redirects to `/login`

---

## 12. Session Hook (Client Components)

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function ProfileButton() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Skeleton />;
  if (!session) return <Link href="/login">Sign In</Link>;

  return <span>{session.user.name}</span>;
}
```

---

## 13. Vercel Deployment Checklist

### Environment Variables (Vercel Dashboard)

| Variable | Value | Required |
|----------|-------|----------|
| `MONGODB_URI` | `mongodb+srv://...` | ✅ |
| `BETTER_AUTH_SECRET` | Random 32+ char string | ✅ |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` | ✅ |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | For Google OAuth |
| `GITHUB_CLIENT_ID` | From GitHub Developer Settings | For GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | From GitHub Developer Settings | For GitHub OAuth |

### Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| `BETTER_AUTH_URL` set to `http://localhost:3000` on Vercel | Auth calls go to wrong URL | Set to `https://your-app.vercel.app` |
| Only checking non-prefixed cookie name in proxy | Infinite redirect loop in production | Check both `better-auth.session_token` and `__Secure-better-auth.session_token` |
| Missing `nextCookies()` plugin | Cookies not set/read properly in Next.js | Add `plugins: [nextCookies()]` to auth config |
| Missing `BETTER_AUTH_SECRET` | Auth crashes silently | Set a random 32+ character secret |
| Google callback URL mismatch | OAuth fails with "redirect_uri_mismatch" | Add exact URL to Google Cloud Console |
| Using `geoip-lite` with static import | Serverless function crash (60MB binary) | Use dynamic `require()` with try/catch |

---

## 14. Security Layers Summary

```
Layer 1: proxy.ts (cookie existence check)
   ↓ Fast, no DB call. Runs on every matched request.
   ↓ Catches 99% of unauthorized access.

Layer 2: dashboard/layout.tsx (server-side session validation)
   ↓ Full DB session check via auth.api.getSession().
   ↓ Catches expired/revoked sessions that still have a cookie.

Layer 3: authGuard() in Server Actions
   ↓ Every mutation re-validates the session.
   ↓ Prevents API abuse even if proxy is bypassed.
```

Never rely on proxy alone — always verify sessions in Server Components and Server Actions.
