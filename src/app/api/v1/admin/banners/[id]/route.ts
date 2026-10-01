import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const bannerId = parseInt(id);
    if (isNaN(bannerId)) return NextResponse.json({ error: 'معرف غير صالح' }, { status: 400 });

    await prisma.banner.delete({ where: { id: bannerId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'فشل حذف البانر' }, { status: 500 });
  }
}
