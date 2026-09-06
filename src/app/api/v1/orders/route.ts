/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Strict Input Stripping: Only extract contact & delivery details + raw items
    // Absolutely ignore any client-supplied prices, totals, or subtotals
    const { name, phone, city, address, notes, items, paymentMethod } = body;

    // Validate customer contact & shipping details
    if (
      !name || typeof name !== 'string' || !name.trim() ||
      !phone || typeof phone !== 'string' || !phone.trim() ||
      !city || typeof city !== 'string' || !city.trim() ||
      !address || typeof address !== 'string' || !address.trim() ||
      !Array.isArray(items) || items.length === 0
    ) {
      return NextResponse.json(
        { error: 'بيانات الطلب غير مكتملة أو غير صالحة' },
        { status: 400 }
      );
    }

    // 2. Strict Item Extraction: Accept ONLY productId and quantity
    const sanitizedItems: { productId: number; quantity: number }[] = [];
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        return NextResponse.json(
          { error: 'بيانات عنصر الطلب غير صالحة' },
          { status: 400 }
        );
      }

      const rawId = item.productId;
      const parsedId = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
      const quantity = item.quantity;

      if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
        return NextResponse.json(
          { error: 'معرف المنتج غير صالح' },
          { status: 400 }
        );
      }

      if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: 'كمية المنتج غير صالحة، يجب أن تكون رقماً صحيحاً أكبر من صفر' },
          { status: 400 }
        );
      }

      sanitizedItems.push({ productId: parsedId, quantity });
    }

    // Aggregate quantities by productId to validate against stock
    const productQuantityMap = new Map<number, number>();
    for (const item of sanitizedItems) {
      productQuantityMap.set(
        item.productId,
        (productQuantityMap.get(item.productId) || 0) + item.quantity
      );
    }

    const productIds = Array.from(productQuantityMap.keys());

    // 3. Fail Closed Database Verification: Fetch authoritative products
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'عذراً، أحد المنتجات المطلوبة غير متوفر أو غير صالح' },
        { status: 400 }
      );
    }

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Fail Closed Stock Verification
    for (const [productId, reqQty] of productQuantityMap.entries()) {
      const dbProduct = dbProductMap.get(productId)!;
      if (reqQty > dbProduct.stockQuantity) {
        return NextResponse.json(
          { 
            error: `الكمية المطلوبة (${reqQty}) غير متوفرة في المخزون للمنتج: "${dbProduct.nameAr}". المتوفر حالياً: ${dbProduct.stockQuantity}` 
          },
          { status: 400 }
        );
      }
    }

    // 4. Exclusive Server-Side Financial Calculation
    let calculatedSubtotal = 0;
    const orderItemsData = sanitizedItems.map((item) => {
      const dbProduct = dbProductMap.get(item.productId)!;
      const officialUnitPrice = dbProduct.price; // authoritative DB price
      const itemTotal = officialUnitPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceAtOrder: officialUnitPrice,
      };
    });

    const calculatedTotalAmount = calculatedSubtotal; // shipping fee = 0

    // 5. Transactional Persistence: Single synchronized transaction
    const order = await prisma.$transaction(async (tx) => {
      // Find or create customer
      let user = await tx.user.findFirst({ where: { phone: phone.trim() } });
      if (!user) {
        user = await tx.user.create({
          data: {
            phone: phone.trim(),
            fullName: name.trim(),
            passwordHash: 'GUEST_NO_LOGIN',
          },
        });
      }

      // Save delivery address
      const savedAddress = await tx.address.create({
        data: {
          userId: user.id,
          fullAddress: address.trim(),
          city: city.trim(),
          isDefault: true,
        },
      });

      // Create Order with strictly calculated amounts
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          addressId: savedAddress.id,
          subtotal: calculatedSubtotal,
          shippingFee: 0,
          total: calculatedTotalAmount,
          status: 'pending',
          paymentMethod: typeof paymentMethod === 'string' && paymentMethod.trim() ? paymentMethod.trim() : 'cod',
          notes: notes && typeof notes === 'string' ? notes.trim() : null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Atomically decrement inventory with condition
      for (const [productId, qtyToDecrement] of productQuantityMap.entries()) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: productId,
            stockQuantity: { gte: qtyToDecrement },
          },
          data: {
            stockQuantity: {
              decrement: qtyToDecrement,
            },
          },
        });

        if (updateResult.count === 0) {
          const outOfStockErr: any = new Error('الكمية المطلوبة لم تعد متوفرة في المخزون أثناء معالجة الطلب');
          outOfStockErr.status = 400;
          throw outOfStockErr;
        }
      }

      return createdOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('Create order error:', error);
    if (((error as any).status) === 400) {
      return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'فشل في حفظ الطلب' }, { status: 500 });
  }
}
