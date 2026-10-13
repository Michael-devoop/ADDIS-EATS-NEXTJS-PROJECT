import { NextResponse } from "next/server";

// Routes that require an active authenticated user session
const PROTECTED_ROUTES = [
  "/checkout",
  "/order-history",
  "/order-status",
  "/admin",
];

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Protects sensitive application routes by verifying the user's session cookie.
 * Redirects signed-out users away from protected routes to /login,
 * and restricts /admin routes strictly to users with the admin role.
 */
export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // Check if current route matches any protected path prefix
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    const sessionCookie = request.cookies.get("session_id")?.value;

    // If no active session cookie is present, redirect to /login
    if (!sessionCookie || !sessionCookie.trim()) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Backward compatibility alias
export const middleware = proxy;

export const config = {
  matcher: [
    "/checkout/:path*",
    "/order-history/:path*",
    "/order-status/:path*",
    "/admin/:path*",
  ],
};
