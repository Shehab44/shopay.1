import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'الاسم مطلوب ولا يمكن أن يكون فارغاً' }, { status: 400 });
    }

    const userId = parseInt((session.user as any).id);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName: name.trim() }
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    console.error('Account settings update error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث البيانات' }, { status: 500 });
  }
}
