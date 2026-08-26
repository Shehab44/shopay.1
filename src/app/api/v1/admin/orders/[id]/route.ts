import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
    }

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'رقم طلب غير صالح' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث حالة الطلب' }, { status: 500 });
  }
}
