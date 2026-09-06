import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

/**
 * Route-Level Defense-in-depth: Verifies authenticated user session and ADMIN role.
 * 
 * Behavior (Fail Closed):
 * - If no session: returns HTTP 401 with { success: false, error: "Unauthorized access" }
 * - If role !== 'ADMIN': returns HTTP 403 with { success: false, error: "Forbidden - Admin access required" }
 * - If admin: returns { session, user }
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  const role = (session.user as unknown)?.role;
  if (!role || role.toUpperCase() !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  return { session, user: session.user };
}
