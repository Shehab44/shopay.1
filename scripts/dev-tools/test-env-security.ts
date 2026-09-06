/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * أداة فحص واختبار أمني: التحقق من انضباط متغيرات البيئة ومبدأ Fail-Closed لـ NextAuth
 * (Fail-Closed Environment & NextAuth Secret Security Isolation Test)
 * 
 * الهدف والفائدة:
 * 1. السيناريو (A) - نجاح الفحص في البيئة المكتملة:
 *    - استدعاء validateEnv() بوجود كافة المتغيرات الإلزامية (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL).
 *    - التحقق: التأكد من مرور الفحص بنجاح دون أي استثناء وعودة كائن المتغيرات المعتمد.
 * 2. السيناريو (B) - تطبيق مبدأ Fail-Closed عند فقدان الأسرار:
 *    - محاكاة فقدان أو تفريغ NEXTAUTH_SECRET في الذاكرة.
 *    - التحقق: التأكد برمجياً من أن validateEnv() ترفض المتابعة وترمي خطأ صريحاً (throw Error)
 *      يوقف تشغيل النظام ويحدد بدقة اسم المتغير المفقود، لمنع عمل التطبيق بمفاتيح ضعيفة أو فارغة.
 * 3. التنظيف الإلزامي:
 *    - استعادة كافة متغيرات البيئة الأصلية في الذاكرة بنسبة 100%.
 */

import { loadEnvConfig } from '@next/env';
import { validateEnv } from '../../src/lib/env';

async function testEnvSecurity() {
  console.log('=== [1] حفظ نسخة احتياطية من متغيرات البيئة الأصلية ===');
  // تحميل متغيرات البيئة من ملفات .env إذا لم تكن محملة
  loadEnvConfig(process.cwd());

  const originalEnv = { ...process.env };

  try {
    // -------------------------------------------------------------
    // السيناريو (A): استدعاء validateEnv بوجود المتغيرات السليمة
    // -------------------------------------------------------------
    console.log('\n=== [2] السيناريو (A): فحص validateEnv في الحالة الطبيعية السليمة ===');
    
    // التأكد من وجود المتغيرات الأساسية للاختبار
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
    process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-key-1234567890123456';
    process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    let validatedResult: any = null;
    try {
      validatedResult = validateEnv();
      console.log('✅ نجح استدعاء validateEnv() في بيئة مكتملة وصالحة.');
      console.log(`- DATABASE_URL: موجود (${validatedResult.DATABASE_URL.slice(0, 10)}...)`);
      console.log(`- NEXTAUTH_URL: ${validatedResult.NEXTAUTH_URL}`);
      console.log(`- NEXTAUTH_SECRET: محمي ومحدد.`);
    } catch (err: any) {
      throw new Error(`فشل السيناريو (A)! أطلقت validateEnv خطأ غير متوقع في بيئة صالحة: ${(err instanceof Error ? err.message : String(err))}`);
    }

    if (!validatedResult || !validatedResult.NEXTAUTH_SECRET) {
      throw new Error('فشل السيناريو (A)! لم يتم إرجاع كائن المتغيرات الصالحة بشكل صحيح.');
    }
    console.log('🛡️ السيناريو (A) نجح بنسبة 100%: تم التحقق من سلامة البيئة المكتملة.');

    // -------------------------------------------------------------
    // السيناريو (B): محاكاة فقدان NEXTAUTH_SECRET واختبار مبدأ Fail-Closed
    // -------------------------------------------------------------
    console.log('\n=== [3] السيناريو (B): محاكاة فقدان NEXTAUTH_SECRET واختبار مبدأ Fail-Closed ===');
    
    // تفريغ وحذف NEXTAUTH_SECRET مؤقتاً بالذاكرة
    delete process.env.NEXTAUTH_SECRET;

    let threwExpectedError = false;
    let caughtErrorMessage = '';

    try {
      validateEnv();
    } catch (err: any) {
      threwExpectedError = true;
      caughtErrorMessage = (err instanceof Error ? err.message : String(err)) || '';
      console.log('رسالة الخطأ الملتقطة بنجاح عند الفقدان:', caughtErrorMessage);
    }

    if (!threwExpectedError) {
      throw new Error('خرق أمني خطير! دالة validateEnv لم ترمِ استثناء عند فقدان NEXTAUTH_SECRET وسمحت للتطبيق بالاستمرار!');
    }

    if (!caughtErrorMessage.includes('NEXTAUTH_SECRET')) {
      throw new Error(`رسالة الخطأ لم تذكر اسم المتغير المفقود NEXTAUTH_SECRET بدقة! الرسالة: "${caughtErrorMessage}"`);
    }

    console.log('🛡️ السيناريو (B) نجح بنسبة 100%: تم تفعيل مبدأ Fail-Closed ورُمي الخطأ المناسب بنجاح.');

    console.log('\n🎉 كفاءة أمان متغيرات البيئة 100%: تم اجتياز الفحص والتحقق من انضباط مسار التوثيق.');

  } catch (error: any) {
    console.error('\n❌ فشل اختبار أمان متغيرات البيئة:', (error instanceof Error ? error.message : String(error)) || error);
    process.exitCode = 1;
  } finally {
    console.log('\n=== [4] التنظيف الإلزامي: استعادة متغيرات البيئة الأصلية بالذاكرة ===');
    try {
      // تفريغ أي مفاتيح أُضيفت أثناء الاختبار
      for (const key of Object.keys(process.env)) {
        if (!(key in originalEnv)) {
          delete process.env[key];
        }
      }
      // استرجاع كافة القيم الأصلية
      Object.assign(process.env, originalEnv);

      console.log('- تم استرجاع NEXTAUTH_SECRET الأصلي في الذاكرة بنجاح.');
      console.log('✅ اكتمل التنظيف: متغيرات البيئة بالذاكرة استُعيدت لحالتها الأصلية بنسبة 100%.');
    } catch (cleanupError: any) {
      console.error('خطأ أثناء عملية تنظيف واستعادة البيئة:', (cleanupError instanceof Error ? cleanupError.message : String(cleanupError)));
    }
  }
}

testEnvSecurity();

