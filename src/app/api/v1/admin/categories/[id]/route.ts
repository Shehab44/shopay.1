import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'معرف قسم غير صالح' }, { status: 400 });
    }

    const body = await request.json();
    const updateData: any = {};
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: unknown) {
    console.error('Admin update category error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث القسم' }, { status: 500 });
  }
}
