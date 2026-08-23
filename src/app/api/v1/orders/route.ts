import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, city, address, notes, items, totalAmount } = body;

    if (!name || !phone || !city || !address || !items || items.length === 0) {
      return NextResponse.json({ error: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }

    // Upsert a guest user or find existing by phone
    // In a real app we'd have proper auth, but since we are keeping it simple:
    let user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          fullName: name,
          passwordHash: "GUEST_NO_LOGIN",
        }
      });
    }

    // Save Address
    const savedAddress = await prisma.address.create({
      data: {
        userId: user.id,
        fullAddress: address,
        city: city,
        isDefault: true,
      }
    });

    // Create Order with Items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: savedAddress.id,
        total: totalAmount,
        status: 'pending',
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unitPriceAtOrder: item.price,
          }))
        }
      },
      include: {
        items: true,
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });
    
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message || 'فشل في حفظ الطلب' }, { status: 500 });
  }
}
