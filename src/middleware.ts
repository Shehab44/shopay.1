import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin and /api/v1/admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/v1/admin')) {
    // Exclude the login page and auth api
    if (pathname === '/admin/login' || pathname === '/api/v1/admin/auth') {
      return NextResponse.next();
    }

    const adminToken = request.cookies.get('admin_token')?.value;
    
    if (!adminToken || adminToken !== 'authenticated') {
      if (pathname.startsWith('/api/v1/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/v1/admin/:path*'],
};
