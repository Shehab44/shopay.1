/* eslint-disable @typescript-eslint/no-explicit-any */
// اختبار عزل للتحقق من تعديل الأقسام والتفرعات يدوياً عبر مسار الإدارة بنسبة 100%

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function extractCookies(response: Response, initialCookie?: string): string {
  let cookieHeaders: string[] = [];
  if (typeof (response.headers as any).getSetCookie === 'function') {
    cookieHeaders = (response.headers as any).getSetCookie();
  } else {
    const raw = response.headers.get('set-cookie');
    if (raw) cookieHeaders = [raw];
  }

  const cookieMap = new Map<string, string>();
  if (initialCookie) {
    initialCookie.split(';').forEach((c) => {
      const [k, ...v] = c.trim().split('=');
      if (k) cookieMap.set(k, v.join('='));
    });
  }

  for (const header of cookieHeaders) {
    const [k, ...v] = header.split(';')[0].trim().split('=');
    if (k) cookieMap.set(k, v.join('='));
  }

  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

async function testAdminProductEdit() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const adminPhone = '00099988877';
  const testPassword = 'AdminPassword123!';

  let targetProduct: any = null;
  let originalCategoryId: number | null = null;
  let originalSubCategoryLabel: string | null = null;

  try {
    console.log('=== [1] إعداد بيئة الفحص والمشرف التجريبي ===');

    // حذف أي مستخدم فحص متبقٍ
    await prisma.user.deleteMany({
      where: { phone: adminPhone },
    });

    const passwordHash = await bcrypt.hash(testPassword, 10);
    await prisma.user.create({
      data: {
        phone: adminPhone,
        fullName: 'مشرف فحص تعديل المنتجات',
        passwordHash,
        role: 'admin',
      },
    });

    console.log('✅ تم إنشاء المشرف التجريبي بنجاح.');

    // تسجيل الدخول واستخراج الكوكيز
    const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const initCookies = extractCookies(csrfRes);

    const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': initCookies,
      },
      body: new URLSearchParams({
        phone: adminPhone,
        password: testPassword,
        csrfToken: csrfData.csrfToken,
        json: 'true',
      }),
      redirect: 'manual',
    });

    const sessionCookies = extractCookies(loginRes, initCookies);
    if (!sessionCookies.includes('session-token')) {
      throw new Error('فشل استخراج جلسة المشرف (session-token)');
    }
    console.log('✅ تم تسجيل دخول المشرف واستخراج الجلسة بنجاح.');

    // اختيار منتج تجريبي وقسمين مختلفين
    targetProduct = await prisma.product.findFirst({
      where: { isActive: true },
      include: { category: true },
    });

    if (!targetProduct) {
      throw new Error('لم يتم العثور على أي منتج صالح للفحص في قاعدة البيانات');
    }

    originalCategoryId = targetProduct.categoryId;
    originalSubCategoryLabel = targetProduct.subCategoryLabel;

    const categories = await prisma.category.findMany({
      take: 5,
      orderBy: { id: 'asc' },
    });

    if (categories.length === 0) {
      throw new Error('لا توجد أقسام في قاعدة البيانات');
    }

    // نختار قسماً جديداً يختلف عن القسم الحالي
    const newCategory = categories.find((c) => c.id !== targetProduct.categoryId) || categories[0];
    const testSubCategoryLabel = 'تفرع تجريبي معزول 100%';

    console.log(`\nالمنتج المختار: ID=${targetProduct.id}, الاسم="${targetProduct.nameAr}"`);
    console.log(`القسم الأصلي: ${targetProduct.categoryId} (${targetProduct.category?.nameAr || 'بدون قسم'})`);
    console.log(`التفرع الأصلي: "${targetProduct.subCategoryLabel || ''}"`);
    console.log(`القسم المستهدف للتعديل: ID=${newCategory.id} (${newCategory.nameAr})`);

    const editApiPath = `${baseUrl}/api/v1/admin/products/${targetProduct.id}`;

    // -----------------------------------------------------------------
    // السيناريو (1): تعديل categoryId و subCategoryLabel عبر مسار PATCH
    // -----------------------------------------------------------------
    console.log('\n=== [2] السيناريو (1): تعديل categoryId و subCategoryLabel عبر مسار PATCH ===');
    const updateRes = await fetch(editApiPath, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookies,
      },
      body: JSON.stringify({
        categoryId: newCategory.id,
        subCategoryLabel: testSubCategoryLabel,
      }),
    });

    console.log(`كود الاستجابة: ${updateRes.status} (المتوقع: 200)`);
    const updateData = await updateRes.json();
    console.log('بيانات الاستجابة:', {
      success: updateData.success,
      updatedCategoryId: updateData.product?.categoryId,
      updatedSubCategory: updateData.product?.subCategoryLabel,
    });

    if (updateRes.status !== 200 || !updateData.success) {
      throw new Error(`فشل تعديل المنتج عبر الـ API! كود الاستجابة: ${updateRes.status}`);
    }

    // التحقق المباشر من قاعدة البيانات
    const dbProductAfterEdit = await prisma.product.findUnique({
      where: { id: targetProduct.id },
    });

    if (dbProductAfterEdit?.categoryId !== newCategory.id) {
      throw new Error(
        `عدم تطابق في قاعدة البيانات! categoryId الفعلي: ${dbProductAfterEdit?.categoryId}، المتوقع: ${newCategory.id}`
      );
    }

    if (dbProductAfterEdit?.subCategoryLabel !== testSubCategoryLabel) {
      throw new Error(
        `عدم تطابق في قاعدة البيانات! subCategoryLabel الفعلي: "${dbProductAfterEdit?.subCategoryLabel}"، المتوقع: "${testSubCategoryLabel}"`
      );
    }

    console.log('🛡️ السيناريو (1) نجح 100%: تم تعديل القسم والتفرع في قاعدة البيانات والـ API بنجاح تام.');

    // -----------------------------------------------------------------
    // السيناريو (2): محاولة ربط بقسم غير موجود (Invalid Category ID) -> رفض بكود 400
    // -----------------------------------------------------------------
    console.log('\n=== [3] السيناريو (2): محاولة الربط بقسم غير موجود (Fail Closed) ===');
    const invalidCatId = 99999999;
    const invalidRes = await fetch(editApiPath, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookies,
      },
      body: JSON.stringify({
        categoryId: invalidCatId,
      }),
    });

    console.log(`كود الاستجابة: ${invalidRes.status} (المتوقع: 400)`);
    const invalidData = await invalidRes.json();
    console.log('بيانات الخطأ المرجعة:', invalidData);

    if (invalidRes.status !== 400) {
      throw new Error(`خرق أمني/تحقق! تم قبول معرف قسم وهمي دون رفض بكود 400 (الكود: ${invalidRes.status})`);
    }

    // التحقق أن قاعدة البيانات لم تتلوث
    const dbProductAfterInvalid = await prisma.product.findUnique({
      where: { id: targetProduct.id },
    });

    if (dbProductAfterInvalid?.categoryId === invalidCatId) {
      throw new Error('تلوث في قاعدة البيانات! تم حفظ معرف قسم غير موجود.');
    }

    console.log('🛡️ السيناريو (2) نجح: تم رفض معرف القسم غير الصالح بنجاح ومنع تلوث البيانات.');

    console.log('\n🎉 كفاءة التعديل والفرز اليدوي 100%: كافة الفحوصات تمت بنجاح.');
  } catch (error: any) {
    console.error('\n❌ فشل اختبار تعديل المنتجات:', (error instanceof Error ? error.message : String(error)) || error);
    process.exitCode = 1;
  } finally {
    console.log('\n=== [4] استعادة الحالة الأصلية للمنتج وتنظيف بيانات الاختبار ===');
    try {
      if (targetProduct) {
        await prisma.product.update({
          where: { id: targetProduct.id },
          data: {
            categoryId: originalCategoryId,
            subCategoryLabel: originalSubCategoryLabel,
          },
        });
        console.log(`- تم استعادة بيانات المنتج ID=${targetProduct.id} لحالتها الأصلية تماماً.`);
      }

      const deletedUsers = await prisma.user.deleteMany({
        where: { phone: adminPhone },
      });
      console.log(`- تم حذف المشرف التجريبي (${deletedUsers.count} مستخدم).`);
      console.log('✅ اكتمل التنظيف والتراجع بنسبة 100%: قاعدة البيانات نظيفة ومطابقة لحالتها الأصلية.');
    } catch (cleanupError: any) {
      console.error('خطأ أثناء عملية التنظيف:', (cleanupError instanceof Error ? cleanupError.message : String(cleanupError)));
    } finally {
      await prisma.$disconnect();
    }
  }
}

testAdminProductEdit();

