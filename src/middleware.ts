import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin API routes protection (Defense-in-depth outer layer)
    if (pathname.startsWith("/api/v1/admin")) {
      if (!token) {
        return NextResponse.json(
          { success: false, error: "Unauthorized access" },
          { status: 401 }
        );
      }

      const role = (token as unknown)?.role;
      if (!role || role.toUpperCase() !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }

      return NextResponse.next();
    }

    // Admin dashboard UI pages protection
    if (pathname.startsWith("/admin")) {
      const role = (token as unknown)?.role;
      if (!token || !role || role.toUpperCase() !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow API routes through to the middleware function to respond with JSON 401/403
        if (pathname.startsWith("/api/v1/admin")) {
          return true;
        }

        // For dashboard UI pages, check presence of token
        if (pathname.startsWith("/admin")) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: '/login',
    }
  }
);

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/v1/admin',
    '/api/v1/admin/:path*'
  ],
};
