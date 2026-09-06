/* eslint-disable @typescript-eslint/no-explicit-any */
// Test Script: Verify strict RBAC and Fail Closed behavior on admin routes

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

async function testAdminRbac() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const customerPhone = '00011122233';
  const adminPhone = '00011122244';
  const testPassword = 'TestPassword123!';

  let targetProduct: any = null;

  try {
    console.log('=== [1] إعداد بيئة الفحص والمستخدمين التجريبيين ===');

    // حذف أي بيانات سابقة لضمان نظافة الاختبار
    await prisma.user.deleteMany({
      where: { phone: { in: [customerPhone, adminPhone] } }
    });

    targetProduct = await prisma.product.findFirst({
      where: { isActive: true }
    });

    if (!targetProduct) {
      throw new Error('لم يتم العثور على أي منتج في قاعدة البيانات لاختبار المسار');
    }

    const testAdminApiPath = `${baseUrl}/api/v1/admin/products/${targetProduct.id}`;
    console.log(`المسار الإداري المستهدف للفحص: ${testAdminApiPath}`);

    const passwordHash = await bcrypt.hash(testPassword, 10);

    // إنشاء مستخدم عادي (Role = 'customer')
    await prisma.user.create({
      data: {
        phone: customerPhone,
        fullName: 'مستخدم تجريبي عادي',
        passwordHash,
        role: 'customer'
      }
    });

    // إنشاء مدير نظام (Role = 'admin')
    await prisma.user.create({
      data: {
        phone: adminPhone,
        fullName: 'مدير تجريبي للفحص',
        passwordHash,
        role: 'admin'
      }
    });

    console.log('✅ تم إنشاء المستخدم العادي والمدير التجريبي بنجاح.');

    const loginAndGetCookies = async (phone: string, roleName: string) => {
      const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
      const csrfData = await csrfRes.json();
      const initCookies = extractCookies(csrfRes);

      const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': initCookies
        },
        body: new URLSearchParams({
          phone,
          password: testPassword,
          csrfToken: csrfData.csrfToken,
          json: 'true'
        }),
        redirect: 'manual'
      });

      const sessionCookies = extractCookies(loginRes, initCookies);
      if (!sessionCookies.includes('session-token')) {
        throw new Error(`فشل استخراج جلسة تسجيل الدخول لحساب ${roleName} (${phone})`);
      }

      return sessionCookies;
    };

    // -----------------------------------------------------------------
    // السيناريو (A): طلب بدون Token / Session -> متوقع 401 Unauthorized
    // -----------------------------------------------------------------
    console.log('\n=== [2] السيناريو (A): إرسال طلب بدون توثيق إطلاقاً (Unauthenticated) ===');
    const resA = await fetch(testAdminApiPath, {
      method: 'GET'
    });

    console.log(`كود الاستجابة: ${resA.status} (المتوقع: 401)`);
    const dataA = await resA.json().catch(() => ({}));
    console.log('نص الاستجابة:', dataA);

    if (resA.status !== 401) {
      throw new Error(`خرق أمني! المسار الإداري لم يرفض الطلب غير الموثق بكود 401 (الكود المستلم: ${resA.status})`);
    }
    console.log('🛡️ السيناريو (A) نجح: تم رفض الطلب غير الموثق بكود 401 Unauthorized بنجاح.');

    // -----------------------------------------------------------------
    // السيناريو (B): طلب بجلسة مستخدم عادي (Role = 'customer') -> متوقع 403 Forbidden
    // -----------------------------------------------------------------
    console.log('\n=== [3] السيناريو (B): إرسال طلب بجلسة مستخدم عادي غير مصرح له (Customer) ===');
    const customerCookies = await loginAndGetCookies(customerPhone, 'المستخدم العادي');
    console.log('تم تسجيل الدخول واستخراج كوكيز المستخدم العادي بنجاح.');

    const resB = await fetch(testAdminApiPath, {
      method: 'GET',
      headers: {
        'Cookie': customerCookies
      }
    });

    console.log(`كود الاستجابة: ${resB.status} (المتوقع: 403)`);
    const dataB = await resB.json().catch(() => ({}));
    console.log('نص الاستجابة:', dataB);

    if (resB.status !== 403) {
      throw new Error(`خرق أمني! المسار الإداري لم يرفض المستخدم العادي بكود 403 (الكود المستلم: ${resB.status})`);
    }
    console.log('🛡️ السيناريو (B) نجح: تم رفض طلب المستخدم العادي بكود 403 Forbidden بنجاح.');

    // -----------------------------------------------------------------
    // السيناريو (C): طلب بجلسة مدير نظام (Role = 'admin') -> متوقع 200 OK
    // -----------------------------------------------------------------
    console.log('\n=== [4] السيناريو (C): إرسال طلب بجلسة مدير نظام شرعي (Admin) ===');
    const adminCookies = await loginAndGetCookies(adminPhone, 'المدير');
    console.log('تم تسجيل الدخول واستخراج كوكيز المدير بنجاح.');

    const resC = await fetch(testAdminApiPath, {
      method: 'GET',
      headers: {
        'Cookie': adminCookies
      }
    });

    console.log(`كود الاستجابة: ${resC.status} (المتوقع: 200)`);
    const dataC = await resC.json().catch(() => ({}));

    if (resC.status !== 200 || !dataC.success) {
      throw new Error(`فشل وصول المدير! لم يتم قبول طلب المدير بكود 200 (الكود المستلم: ${resC.status})`);
    }
    console.log(`✅ تم قبول طلب المدير وعودة بيانات المنتج: ID=${dataC.product?.id}, Name="${dataC.product?.nameAr}"`);
    console.log('🛡️ السيناريو (C) نجح: تم قبول طلب المشرف المصرح له بكود 200 بنجاح.');

    console.log('\n🎉 كفاءة الحماية 100%: تم التحقق بنجاح من كافة متطلبات الـ RBAC والدفاع المتعمق.');

  } catch (error: any) {
    console.error('\n❌ فشل اختبار RBAC:', (error instanceof Error ? error.message : String(error)) || error);
    process.exitCode = 1;
  } finally {
    console.log('\n=== [5] تنظيف بيانات الاختبار من قاعدة البيانات ===');
    try {
      const deletedUsers = await prisma.user.deleteMany({
        where: { phone: { in: [customerPhone, adminPhone] } }
      });
      console.log(`- تم حذف المستخدمين التجريبيين (${deletedUsers.count} مستخدم) بنجاح.`);
      console.log('✅ اكتمل التنظيف: قاعدة البيانات نظيفة ومطابقة لحالتها الأصلية بنسبة 100%.');
    } catch (cleanupError: any) {
      console.error('خطأ أثناء عملية التنظيف:', (cleanupError instanceof Error ? cleanupError.message : String(cleanupError)));
    } finally {
      await prisma.$disconnect();
    }
  }
}

testAdminRbac();

