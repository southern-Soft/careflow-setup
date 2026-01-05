import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware for Southern Apparels IOT
 *
 * Handles:
 * - Route protection (authenticated vs public routes)
 * - Auth redirects (login → dashboard, dashboard → login)
 * - Legacy route support (for backward compatibility)
 */

import { AUTH_CONFIG } from "@/lib/config";

// Cookie name for authentication (matches auth-context.tsx)
const COOKIE_NAME = AUTH_CONFIG.COOKIE_NAME;

// Legacy cookie name for backward compatibility
const LEGACY_COOKIE_NAME = AUTH_CONFIG.LEGACY_COOKIE_NAME;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes (no auth required)
  const publicRoutes = [
    // New root-level auth routes
    "/login",
    "/register",
    "/forgot-password",
    // Legacy routes (for backward compatibility)
    "/dashboard/login",
    "/dashboard/register",
    "/dashboard/forgot-password",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if it's an API route (skip auth check)
  const isApiRoute = pathname.startsWith("/api");

  // Check if it's a static asset
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".");

  // Get token from cookies (try new cookie name first, then legacy)
  const token =
    request.cookies.get(COOKIE_NAME)?.value ||
    request.cookies.get(LEGACY_COOKIE_NAME)?.value;

  // Skip middleware for API routes and static assets
  if (isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware]", {
      pathname,
      hasToken: !!token,
      isPublicRoute,
      cookieName: COOKIE_NAME,
    });
  }

  // Handle protected dashboard routes
  if (pathname.startsWith("/dashboard") && !isPublicRoute && !token) {
    // Redirect to new login route
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle public routes with token (redirect to dashboard)
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/dashboard/IOT", request.url));
  }

  // Handle root path redirect
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard/IOT", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Handle /dashboard redirect (no subpath)
  if (pathname === "/dashboard") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard/IOT", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Handle legacy login route redirect to new route
  if (pathname === "/dashboard/login" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle legacy forgot-password route redirect to new route
  if (pathname === "/dashboard/forgot-password" && !token) {
    return NextResponse.redirect(new URL("/forgot-password", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
