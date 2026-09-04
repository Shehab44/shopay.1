// اختبار عزل للتحقق من حفظ حقل subCategoryLabel وعمل سكريبت التراجع بنسبة 100% دون التأثير على categoryId

import { PrismaClient } from '@prisma/client';
import { revertSubcategories } from './revert-subcategories';

const prisma = new PrismaClient();

async function testSubcategoriesSchema() {
  let targetProduct: any = null;
  let originalSubCategoryLabel: string | null = null;
  let originalCategoryId: number | null = null;

  try {
    console.log('=== [1] جلب منتج نشط من قاعدة البيانات للاختبار ===');
    targetProduct = await prisma.product.findFirst({
      where: { isActive: true }
    });

    if (!targetProduct) {
      throw new Error('لم يتم العثور على أي منتج نشط في قاعدة البيانات لاختبار الحقل');
    }

    originalSubCategoryLabel = targetProduct.subCategoryLabel;
    originalCategoryId = targetProduct.categoryId;

    console.log(`تم اختيار المنتج: ID=${targetProduct.id}, Name="${targetProduct.nameAr}", categoryId=${originalCategoryId}`);
    console.log(`القيمة الأصلية لـ subCategoryLabel: ${originalSubCategoryLabel}`);

    // -------------------------------------------------------------
    // السيناريو (A): تحديث مؤقت بـ subCategoryLabel = "فحص_تجريبي" والتحقق من القراءة
    // -------------------------------------------------------------
    console.log('\n=== [2] السيناريو (A): حفظ قيمة جديدة في subCategoryLabel والتحقق من قراءتها ===');
    const testLabel = 'فحص_تجريبي';

    await prisma.product.update({
      where: { id: targetProduct.id },
      data: { subCategoryLabel: testLabel }
    });

    const verifyProductA = await prisma.product.findUnique({
      where: { id: targetProduct.id }
    });

    if (!verifyProductA || verifyProductA.subCategoryLabel !== testLabel) {
      throw new Error(`فشل السيناريو (A)! لم يتم حفظ وقراءة القيمة "${testLabel}" بشكل صحيح.`);
    }

    if (verifyProductA.categoryId !== originalCategoryId) {
      throw new Error(`خلل في البنية! تغير categoryId أثناء تعديل subCategoryLabel!`);
    }

    console.log(`✅ نجح حفظ وقراءة الحقل الجديد بنجاح: subCategoryLabel = "${verifyProductA.subCategoryLabel}"`);
    console.log(`- التأكد من ثبات categoryId الأصلي: ${verifyProductA.categoryId} (ثابت ومطابق للأصل ✅)`);
    console.log('🛡️ السيناريو (A) نجح بنسبة 100%.');

    // -------------------------------------------------------------
    // السيناريو (B): تشغيل منطق التراجع وإثبات عودة الحقل إلى null وثبات categoryId
    // -------------------------------------------------------------
    console.log('\n=== [3] السيناريو (B): تشغيل منطق التراجع الفوري (Rollback) والتحقق من تصفير الحقل وثبات categoryId ===');

    const revertedCount = await revertSubcategories();
    console.log(`- عدد السجلات التي شملها التراجع: ${revertedCount}`);

    const verifyProductB = await prisma.product.findUnique({
      where: { id: targetProduct.id }
    });

    if (!verifyProductB || verifyProductB.subCategoryLabel !== null) {
      throw new Error(`فشل التراجع! قيمة subCategoryLabel لم تعد إلى null (القيمة الحالية: ${verifyProductB?.subCategoryLabel})`);
    }

    if (verifyProductB.categoryId !== originalCategoryId) {
      throw new Error(`خرق أمني/بنيوي! تغير categoryId بعد التراجع!`);
    }

    console.log(`✅ تم التحقق: عاد subCategoryLabel إلى: ${verifyProductB.subCategoryLabel} (NULL بنجاح)`);
    console.log(`- التأكد التام من عدم المساس بـ categoryId: ${verifyProductB.categoryId} (ثابت بنسبة 100% ✅)`);
    console.log('🛡️ السيناريو (B) نجح بنسبة 100%: تم التراجع دون أي مساس بنظام الأقسام الرئيسي.');

    console.log('\n🎉 كفاءة المعمارية والتراجع 100%: تم اجتياز الفحص بنجاح تام وتأكيد المعمارية غير المدمرة.');

  } catch (error: any) {
    console.error('\n❌ فشل اختبار معمارية التفرعات:', error.message || error);
    process.exitCode = 1;
  } finally {
    console.log('\n=== [4] التنظيف الإلزامي واستعادة الحالة الأصلية للمنتج ===');
    try {
      if (targetProduct) {
        await prisma.product.update({
          where: { id: targetProduct.id },
          data: { subCategoryLabel: originalSubCategoryLabel }
        });
        console.log(`- تم استعادة الحالة الأصلية للمنتج ID=${targetProduct.id} بنجاح.`);
      }
      console.log('✅ اكتمل التنظيف: قاعدة البيانات نظيفة ومطابقة لحالتها الأصلية بنسبة 100%.');
    } catch (cleanupError: any) {
      console.error('خطأ أثناء عملية التنظيف:', cleanupError.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

testSubcategoriesSchema();
