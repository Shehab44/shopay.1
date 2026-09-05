// Test Script: Verify server rejects or ignores client-side price tampering in orders route

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOrderPriceTampering() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const testPhone = '00033322211';
  let targetProduct: any = null;
  let originalStock = 0;
  let createdOrderId: number | null = null;

  try {
    console.log('=== [1] جلب منتج حقيقي من قاعدة البيانات ومعرفة سعره الأصلي ===');
    targetProduct = await prisma.product.findFirst({
      where: { isActive: true, price: { gt: 1 } }
    });

    if (!targetProduct) {
      throw new Error('لم يتم العثور على منتج نشط بسعر مناسب للاختبار');
    }

    originalStock = targetProduct.stockQuantity;
    const officialPrice = targetProduct.price;
    console.log(`المنتج المستهدف: ID=${targetProduct.id}, الاسم="${targetProduct.nameAr}", السعر الأصلي في قاعدة البيانات=${officialPrice}$, المخزون الأصلي=${originalStock}`);

    // تهيئة مخزون مؤقت للمنتج للتأكد من كفايته لإجراء الاختبار
    const testStock = 10;
    await prisma.product.update({
      where: { id: targetProduct.id },
      data: { stockQuantity: testStock }
    });
    console.log(`تم ضبط المخزون مؤقتاً للاختبار إلى: ${testStock}`);

    // محاولة تزوير الأسعار بحقن price = 0.01$ و total = 0.01$
    console.log('\n=== [2] إرسال طلب POST مع تزوير السعر عمداً (price: 0.01$, totalAmount: 0.01$) ===');
    const fakePrice = 0.01;
    const fakeTotal = 0.01;
    const quantity = 2;
    const expectedSubtotal = officialPrice * quantity;
    const expectedTotal = expectedSubtotal;

    const payload = {
      name: 'مهاجم تزوير الأسعار',
      phone: testPhone,
      city: 'مدينة الاختبار',
      address: 'شارع الاختبار 101',
      notes: 'محاولة حقن أسعار مزورة للطلب',
      totalAmount: fakeTotal,
      items: [
        {
          productId: targetProduct.id,
          quantity: quantity,
          price: fakePrice,
          unitPrice: fakePrice
        }
      ]
    };

    console.log(`البيانات المرسلة من العميل: price=${fakePrice}$, totalAmount=${fakeTotal}$, quantity=${quantity}`);
    console.log(`المبالغ الحقيقية المتوقعة بالسيرفر: unitPrice=${officialPrice}$, total=${expectedTotal}$`);

    const response = await fetch(`${baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(`كود الاستجابة: ${response.status}`);
    console.log('بيانات الاستجابة:', data);

    if (!response.ok || !data.success) {
      throw new Error(`فشل إنشاء الطلب: ${JSON.stringify(data)}`);
    }

    createdOrderId = data.orderId;
    console.log(`✅ تم إنشاء الطلب برقم المعرف: ${createdOrderId}`);

    // التحقق المباشر من قاعدة البيانات
    console.log('\n=== [3] التحقق من السجل الناتج في قاعدة البيانات ===');
    const savedOrder = await prisma.order.findUnique({
      where: { id: createdOrderId! },
      include: { items: true }
    });

    if (!savedOrder) {
      throw new Error(`لم يتم العثور على الطلب رقم ${createdOrderId} في قاعدة البيانات`);
    }

    const savedUnitPrice = savedOrder.items[0]?.unitPriceAtOrder;
    const savedTotal = savedOrder.total;
    const savedSubtotal = savedOrder.subtotal;

    console.log(`- السعر المزور المحقون من العميل: ${fakePrice}$`);
    console.log(`- سعر الوحدة المسجل بالطلب: ${savedUnitPrice}$ (المتوقع: ${officialPrice}$)`);
    console.log(`- المجموع الفرعي المسجل بالطلب: ${savedSubtotal}$ (المتوقع: ${expectedSubtotal}$)`);
    console.log(`- الإجمالي الكلي المسجل بالطلب: ${savedTotal}$ (المتوقع: ${expectedTotal}$)`);

    if (savedUnitPrice === fakePrice || savedTotal === fakeTotal) {
      throw new Error('خرق أمني خطير! السيرفر قبل السعر المزور وحفظه في قاعدة البيانات!');
    }

    if (savedUnitPrice !== officialPrice || savedTotal !== expectedTotal) {
      throw new Error(`خطأ مالي! المبالغ المحفوظة لا تطابق السعر الرسمي المسجل بالسيرفر`);
    }

    console.log('🛡️ تم التحقق بنجاح: السيرفر تجاهل الأسعار والمجاميع المزورة واعتمد حصراً أسعار قاعدة البيانات الرسمية!');

    // التحقق من تحديث المخزون داخل الـ Transaction
    const updatedProduct = await prisma.product.findUnique({
      where: { id: targetProduct.id }
    });
    const expectedStockAfter = testStock - quantity;
    console.log(`- فحص المخزون بعد العملية: ${updatedProduct?.stockQuantity} (المتوقع: ${expectedStockAfter})`);
    if (updatedProduct?.stockQuantity !== expectedStockAfter) {
      throw new Error('فشل تحديث المخزون الذري داخل المعاملة!');
    }
    console.log('✅ تم تحديث المخزون داخل المعاملة بنجاح.');

    console.log('\n🎉 الفحص ناجح بنسبة 100%: تم عزل واحتساب أسعار الطلبات بالسيرفر بالكامل.');

  } catch (error: any) {
    console.error('\n❌ فشل اختبار عزل الأسعار:', error.message || error);
    process.exitCode = 1;
  } finally {
    console.log('\n=== [4] تنظيف بيانات الاختبار وإعادة قاعدة البيانات لحالتها الأصلية 100% ===');
    try {
      if (createdOrderId) {
        await prisma.orderItem.deleteMany({ where: { orderId: createdOrderId } });
        await prisma.order.deleteMany({ where: { id: createdOrderId } });
        console.log(`- تم حذف الطلب التجريبي رقم ${createdOrderId} وعناصره بنجاح.`);
      }

      const testUser = await prisma.user.findFirst({ where: { phone: testPhone } });
      if (testUser) {
        await prisma.address.deleteMany({ where: { userId: testUser.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
        console.log('- تم حذف المستخدم التجريبي والعنوان.');
      }

      if (targetProduct) {
        await prisma.product.update({
          where: { id: targetProduct.id },
          data: { stockQuantity: originalStock }
        });
        console.log(`- تمت إعادة مخزون المنتج (${targetProduct.id}) لحالته الأصلية: ${originalStock}.`);
      }

      console.log('✅ تم الانتهاء من التنظيف: قاعدة البيانات نظيفة 100%.');
    } catch (cleanupErr: any) {
      console.error('خطأ أثناء التنظيف:', cleanupErr.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

testOrderPriceTampering();
