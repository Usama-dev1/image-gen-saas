import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "better-auth.session_token";
const SECURE_COOKIE_NAME = `__Secure-${COOKIE_NAME}`;

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

function hasSessionCookie(request: NextRequest) {
  const secureCookie = request.cookies.get(SECURE_COOKIE_NAME);
  const normalCookie = request.cookies.get(COOKIE_NAME);
  return !!(secureCookie?.value || normalCookie?.value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = hasSessionCookie(request);

  // 1. Redirect unauthenticated users away from protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthRoute && isLoggedIn) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Allow all other requests through
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
