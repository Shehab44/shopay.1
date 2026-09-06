/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * أداة فحص واختبار أمني: اختبار الذرية والتراجع التام لمسار استيراد المنتجات
 * (Atomic All-or-Nothing Product Import & Rollback Isolation Test)
 * 
 * الهدف والفائدة:
 * 1. السيناريو الأول (استيراد دفعة سليمة بنجاح):
 *    - إرسال ملف إكسل يحتوي على صفوف صالحة تماماً.
 *    - التحقق: التأكد من استلام كود 200 بنجاح وحفظ كافة المنتجات في قاعدة البيانات.
 * 2. السيناريو الثاني (إثبات التراجع التام All-or-Nothing Rollback):
 *    - إرسال ملف إكسل يحتوي على منتج سليم بالإضافة إلى منتج آخر فاسد متعمداً (سعر سالب).
 *    - التحقق: التأكد من رفض الخادم للعملية بالكامل بكود 400 مع توضيح السطر المتعثر،
 *      والتأكد بالاستعلام المباشر من قاعدة البيانات أن المنتج السليم المصاحب في نفس الدفعة لم يُحفظ نهائياً (إثبات الـ Rollback بنسبة 100%).
 * 3. التنظيف الإلزامي:
 *    - حذف كافة المنتجات التجريبية والمدير التجريبي فوراً وإعادة قاعدة البيانات لحالتها الأصلية تماماً.
 */

import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
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

async function testImportRollback() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const adminPhone = '00099988811';
  const adminPassword = 'AdminPassword123!';

  const batch1Products = [
    { matCode: '1019001', name: 'سخان تجريبي سليم 1', price: 15.5 },
    { matCode: '1019002', name: 'سخان تجريبي سليم 2', price: 28.0 }
  ];

  const batch2ValidProduct = { matCode: '1019003', name: 'سخان تجريبي سليم 3', price: 42.0 };
  const batch2CorruptProduct = { matCode: '1019004', name: 'منتج فاسد بسعر سالب', price: -99.0 };

  const allTestMatCodes = [
    '1019001',
    '1019002',
    '1019003',
    '1019004'
  ];

  try {
    console.log('=== [1] تجهيز حساب المدير التجريبي والجلسة وتنظيف أي مخلفات سابقة ===');

    await prisma.product.deleteMany({
      where: { matCode: { in: allTestMatCodes } }
    });
    await prisma.user.deleteMany({
      where: { phone: adminPhone }
    });

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        phone: adminPhone,
        fullName: 'مدير فحص الاستيراد',
        passwordHash,
        role: 'admin'
      }
    });

    // تسجيل الدخول واستخراج الكوكيز
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
        phone: adminPhone,
        password: adminPassword,
        csrfToken: csrfData.csrfToken,
        json: 'true'
      }),
      redirect: 'manual'
    });

    const sessionCookies = extractCookies(loginRes, initCookies);
    if (!sessionCookies.includes('session-token')) {
      throw new Error('فشل في استخراج كوكيز الجلسة للمدير التجريبي');
    }
    console.log('✅ تم تسجيل دخول المدير التجريبي وتجهيز الجلسة.');

    // دالة مساعدة لإنشاء ملف إكسل بصيغة Buffer
    const createExcelBuffer = async (rows: { matCode: string; name: string; price: any }[]) => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');
      worksheet.columns = [
        { header: 'الرمز', key: 'matCode' },
        { header: 'الاسم', key: 'name' },
        { header: 'السعر الإفرادي', key: 'price' }
      ];
      for (const r of rows) {
        worksheet.addRow(r);
      }
      return await workbook.xlsx.writeBuffer();
    };

    // -------------------------------------------------------------
    // السيناريو الأول: استيراد دفعة سليمة والتأكد من إتمام الحفظ (200)
    // -------------------------------------------------------------
    console.log('\n=== [2] السيناريو الأول: استيراد دفعة سليمة 100% ===');
    const validBuffer = await createExcelBuffer(batch1Products);
    const validBlob = new Blob([validBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const formData1 = new FormData();
    formData1.append('file', validBlob, 'valid-import.xlsx');

    const res1 = await fetch(`${baseUrl}/api/v1/admin/import/commit`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookies },
      body: formData1
    });

    console.log(`كود الاستجابة: ${res1.status} (المتوقع: 200)`);
    const data1 = await res1.json();
    console.log('بيانات الاستجابة:', data1);

    if (res1.status !== 200 || !data1.success || data1.processed !== 2) {
      throw new Error(`فشل السيناريو الأول! لم يتم استيراد الدفعة السليمة كما يجب.`);
    }

    // التحقق المباشر من قاعدة البيانات
    const dbProduct1 = await prisma.product.findUnique({ where: { matCode: '1019001' } });
    const dbProduct2 = await prisma.product.findUnique({ where: { matCode: '1019002' } });

    if (!dbProduct1 || dbProduct1.price !== 15.5 || !dbProduct2 || dbProduct2.price !== 28.0) {
      throw new Error('المنتجات السليمة غير مسجلة بشكل صحيح في قاعدة البيانات!');
    }
    console.log('🛡️ السيناريو الأول نجح: تم استيراد الدفعة السليمة وحفظها بنجاح.');

    // -------------------------------------------------------------
    // السيناريو الثاني: استيراد دفعة تحتوي على صف فاسد متعمداً وإثبات الـ Rollback
    // -------------------------------------------------------------
    console.log('\n=== [3] السيناريو الثاني: استيراد دفعة تحتوي على صف فاسد والتحقق من التراجع التام (Rollback) ===');
    const mixedBatch = [
      batch2ValidProduct,   // صف سليم
      batch2CorruptProduct  // صف فاسد (سعر سالب)
    ];

    const corruptBuffer = await createExcelBuffer(mixedBatch);
    const corruptBlob = new Blob([corruptBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const formData2 = new FormData();
    formData2.append('file', corruptBlob, 'corrupt-import.xlsx');

    const res2 = await fetch(`${baseUrl}/api/v1/admin/import/commit`, {
      method: 'POST',
      headers: { 'Cookie': sessionCookies },
      body: formData2
    });

    console.log(`كود الاستجابة: ${res2.status} (المتوقع: 400)`);
    const data2 = await res2.json();
    console.log('رسالة الخطأ المستلمة من السيرفر:', data2.error);

    if (res2.status !== 400) {
      throw new Error(`خرق لمعايير الأمان! السيرفر لم يرفض الدفعة الفاسدة بكود 400 (الكود المستلم: ${res2.status})`);
    }

    // إثبات الـ Rollback القطعي: فحص قاعدة البيانات للتأكد من عدم تسجيل المنتج السليم المصاحب
    const dbProduct3 = await prisma.product.findUnique({ where: { matCode: '1019003' } });
    const dbProduct4 = await prisma.product.findUnique({ where: { matCode: '1019004' } });

    console.log(`- فحص المنتج السليم المصاحب في الدفعة (1019003): ${dbProduct3 === null ? 'غير موجود نهائياً (تم التراجع بنجاح ✅)' : 'موجود (فشل التراجع ❌)'}`);
    console.log(`- فحص المنتج الفاسد (1019004): ${dbProduct4 === null ? 'غير موجود نهائياً ✅' : 'موجود (خطأ ❌)'}`);

    if (dbProduct3 !== null || dbProduct4 !== null) {
      throw new Error('فشل الـ Rollback! وُجدت سجلات من الدفعة الفاسدة مسجلة في قاعدة البيانات!');
    }

    console.log('🛡️ السيناريو الثاني نجح بنسبة 100%: تم التراجع التام (All-or-Nothing Rollback) ولم يُحفظ أي سجل.');
    console.log('\n🎉 كفاءة العمليات الذرية 100%: تم اجتياز كلا السيناريوهين بنجاح تام!');

  } catch (error: any) {
    console.error('\n❌ فشل الاختبار:', (error instanceof Error ? error.message : String(error)) || error);
    process.exitCode = 1;
  } finally {
    console.log('\n=== [4] التنظيف الإلزامي الشامل واستعادة حالة قاعدة البيانات 100% ===');
    try {
      const deletedProds = await prisma.product.deleteMany({
        where: { matCode: { in: allTestMatCodes } }
      });
      console.log(`- تم حذف المنتجات التجريبية المنشأة (${deletedProds.count} منتج).`);

      const deletedAdmin = await prisma.user.deleteMany({
        where: { phone: adminPhone }
      });
      console.log(`- تم حذف حساب المدير التجريبي (${deletedAdmin.count} مستخدم).`);

      console.log('✅ تم الانتهاء من التنظيف: قاعدة البيانات نظيفة ومطابقة لحالتها الأصلية بنسبة 100%.');
    } catch (cleanupError: any) {
      console.error('خطأ أثناء عملية التنظيف:', (cleanupError instanceof Error ? cleanupError.message : String(cleanupError)));
    } finally {
      await prisma.$disconnect();
    }
  }
}

testImportRollback();
