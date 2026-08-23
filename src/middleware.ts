import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Admin routes protection
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/v1/admin")) {
      if (token?.role !== "admin") {
        if (pathname.startsWith("/api/v1/admin")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Only trigger middleware for these specific routes
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/v1/admin")) {
          return !!token; // Must be logged in
        }
        return true; // Public routes pass through
      },
    },
    pages: {
      signIn: '/login',
    }
  }
);

export const config = {
  matcher: ['/admin/:path*', '/api/v1/admin/:path*'],
};
