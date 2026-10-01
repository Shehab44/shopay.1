import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    if (!body.imageUrl) {
      return NextResponse.json({ error: 'صورة البانر مطلوبة' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl || null,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: unknown) {
    console.error('Admin create banner error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة البانر' }, { status: 500 });
  }
}
