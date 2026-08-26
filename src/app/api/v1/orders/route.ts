import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, city, address, notes, items, totalAmount } = body;

    if (!name || !phone || !city || !address || !items || items.length === 0) {
      return NextResponse.json({ error: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }

    // --- SECURITY FIX: QUANTITY VALIDATION ---
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: 'كمية المنتج غير صالحة، يجب أن تكون رقماً صحيحاً أكبر من صفر.' }, { status: 400 });
      }
    }
    // -----------------------------------------

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

    // --- SECURITY FIX: SERVER-SIDE PRICE VALIDATION ---
    // Extract unique product IDs requested by the client
    const productIds = Array.from(new Set(items.map((item: any) => item.productId))) as number[];
    
    // Fetch real product data from the database
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    // Check if all requested products actually exist
    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'عذراً، أحد المنتجات المطلوبة غير متوفر أو غير صالح' }, { status: 400 });
    }

    // Calculate real total and map items using database prices
    let realTotalAmount = 0;
    const validatedItems = items.map((item: any) => {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      const realPrice = dbProduct!.price;
      
      realTotalAmount += realPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceAtOrder: realPrice // Force real price from DB
      };
    });
    // --------------------------------------------------

    // Create Order with Validated Items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: savedAddress.id,
        total: realTotalAmount,
        status: 'pending',
        notes: notes || null,
        items: {
          create: validatedItems
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
