/* eslint-disable @typescript-eslint/no-explicit-any */
// اختبار عزل للتحقق من دقة تسكين التفرعات ومنع التطابق الجزئي والتأكد من ثبات categoryId بنسبة 100%

import { PrismaClient } from '@prisma/client';
import { matchSubcategory } from './apply-subcategories';
import { revertSubcategories } from './revert-subcategories';

const prisma = new PrismaClient();

async function testApplySubcategories() {
  const dummyCodes = ['TEST_SUB_001', 'TEST_SUB_002', 'TEST_SUB_003'];

  try {
    console.log('=== [1] بدء فحص العزل لتسكين التفرعات ومنع التطابق الجزئي ===');

    // تنظيف أي بيانات سابقة
    await prisma.product.deleteMany({
      where: { matCode: { in: dummyCodes } },
    });

    // جلب قسم ألعاب الأطفال [106] وقسم أدوات منزلية ومطبخ [103]
    const toysCat = await prisma.category.findUnique({ where: { codePrefix: '106' } });
    const kitchenCat = await prisma.category.findUnique({ where: { codePrefix: '103' } });

    if (!toysCat || !kitchenCat) {
      throw new Error('لم يتم العثور على الأقسام المطلوبة (106 أو 103)');
    }

    // -----------------------------------------------------------------
    // السيناريو (A): فحص دقة المطابقة ومنع فخاخ التطابق الجزئي
    // -----------------------------------------------------------------
    console.log('\n=== [2] السيناريو (A): فحص دقة المطابقة ومنع الفخاخ (Substring Traps) ===');

    // 1. فحص المطابقة المباشرة لدالة matchSubcategory
    const matchFard = matchSubcategory('فرد صابون 108 مائي', '106');
    console.log(`- مطابقة "فرد صابون 108 مائي" في قسم 106: النتيجة = "${matchFard}" (المتوقع: "فرد")`);
    if (matchFard !== 'فرد') {
      throw new Error(`فشل مطابقة كلمة "فرد"! النتيجة: ${matchFard}`);
    }

    const matchOnlyMustawrad = matchSubcategory('بضاعة مستورد صيني', '103');
    console.log(`- مطابقة "بضاعة مستورد صيني" (فحص منع فخ مطابقة "ورد" داخل "مستورد") في قسم 103: النتيجة = ${matchOnlyMustawrad} (المتوقع: null)`);
    if (matchOnlyMustawrad === 'ورد') {
      throw new Error('فخ تطابق جزئي! تم مطابقة "ورد" داخل كلمة "مستورد" خطأً!');
    }

    const matchRealWard = matchSubcategory('فازة ورد طبيعي أحمر', '103');
    console.log(`- مطابقة "فازة ورد طبيعي أحمر" في قسم 103: النتيجة = "${matchRealWard}" (المتوقع: "ورد")`);
    if (matchRealWard !== 'ورد') {
      throw new Error(`فشل مطابقة كلمة "ورد" الحقيقية! النتيجة: ${matchRealWard}`);
    }

    // 2. إنشاء منتجات تجريبية في قاعدة البيانات للتحقق العملي
    const p1 = await prisma.product.create({
      data: {
        matCode: 'TEST_SUB_001',
        nameAr: 'فرد صابون تجريبي للفحص',
        price: 50,
        categoryId: toysCat.id,
        subCategoryLabel: null,
      },
    });

    const p2 = await prisma.product.create({
      data: {
        matCode: 'TEST_SUB_002',
        nameAr: 'منتج مستورد عالي الجودة تجريبي',
        price: 100,
        categoryId: kitchenCat.id,
        subCategoryLabel: null,
      },
    });

    const p3 = await prisma.product.create({
      data: {
        matCode: 'TEST_SUB_003',
        nameAr: 'صحن زجاج شفاف ورد أحمر',
        price: 30,
        categoryId: kitchenCat.id,
        subCategoryLabel: null,
      },
    });

    console.log('✅ تم إنشاء 3 منتجات تجريبية بنجاح.');

    // تطبيق التسكين البرمجي على المنتجات التجريبية
    const label1 = matchSubcategory(p1.nameAr, toysCat.codePrefix);
    const label2 = matchSubcategory(p2.nameAr, kitchenCat.codePrefix);
    const label3 = matchSubcategory(p3.nameAr, kitchenCat.codePrefix);

    await prisma.$transaction([
      prisma.product.update({ where: { id: p1.id }, data: { subCategoryLabel: label1 } }),
      prisma.product.update({ where: { id: p2.id }, data: { subCategoryLabel: label2 } }),
      prisma.product.update({ where: { id: p3.id }, data: { subCategoryLabel: label3 } }),
    ], { maxWait: 10000, timeout: 60000 } as any);


    const p1Updated = await prisma.product.findUnique({ where: { id: p1.id } });
    const p2Updated = await prisma.product.findUnique({ where: { id: p2.id } });
    const p3Updated = await prisma.product.findUnique({ where: { id: p3.id } });

    console.log(`- المنتج 1 [${p1.nameAr}]: التفرع المسجل = "${p1Updated?.subCategoryLabel}"`);
    console.log(`- المنتج 2 [${p2.nameAr}]: التفرع المسجل = "${p2Updated?.subCategoryLabel || 'بدون تفرع (null)'}"`);
    console.log(`- المنتج 3 [${p3.nameAr}]: التفرع المسجل = "${p3Updated?.subCategoryLabel}"`);

    if (p1Updated?.subCategoryLabel !== 'فرد') {
      throw new Error(`المنتج 1 لم يُسكن في فئة "فرد"! القيمة: ${p1Updated?.subCategoryLabel}`);
    }
    if (p2Updated?.subCategoryLabel === 'ورد') {
      throw new Error('المنتج 2 تم تسكينه خطأً كـ "ورد" بسبب فخ التطابق الجزئي داخل "مستورد"!');
    }

    console.log('🛡️ السيناريو (A) نجح بنسبة 100%: تم تسكين "فرد" بنجاح ومنع فخ التطابق الجزئي تماماً.');

    // -----------------------------------------------------------------
    // السيناريو (B): التأكد التام من ثبات categoryId وعدم المساس به
    // -----------------------------------------------------------------
    console.log('\n=== [3] السيناريو (B): التأكد التام من ثبات categoryId بنسبة 100% ===');
    console.log(`- المنتج 1: categoryId الأصلي=${p1.categoryId} -> الحالي=${p1Updated?.categoryId}`);
    console.log(`- المنتج 2: categoryId الأصلي=${p2.categoryId} -> الحالي=${p2Updated?.categoryId}`);
    console.log(`- المنتج 3: categoryId الأصلي=${p3.categoryId} -> الحالي=${p3Updated?.categoryId}`);

    if (
      p1Updated?.categoryId !== p1.categoryId ||
      p2Updated?.categoryId !== p2.categoryId ||
      p3Updated?.categoryId !== p3.categoryId
    ) {
      throw new Error('خرق سلامة البيانات! تم تعديل categoryId أثناء عملية التسكين!');
    }

    console.log('🛡️ السيناريو (B) نجح بنسبة 100%: categoryId ثابت تماماً ولم يطرأ عليه أي تغيير.');

    // -----------------------------------------------------------------
    // السيناريو (C): التحقق من قدرة سكريبت التراجع revert-subcategories على استعادة null
    // -----------------------------------------------------------------
    console.log('\n=== [4] السيناريو (C): التحقق من قدرة سكريبت التراجع على استعادة null ===');
    const revertCount = await revertSubcategories();
    console.log(`- عدد السجلات التي شملها التراجع: ${revertCount}`);

    const p1Reverted = await prisma.product.findUnique({ where: { id: p1.id } });
    const p3Reverted = await prisma.product.findUnique({ where: { id: p3.id } });

    if (p1Reverted?.subCategoryLabel !== null || p3Reverted?.subCategoryLabel !== null) {
      throw new Error('فشل التراجع! بعض المنتجات لم تعد قيمتها إلى null.');
    }

    console.log('🛡️ السيناريو (C) نجح بنسبة 100%: سكريبت التراجع صفر القيم بنجاح وأعاد الحالة إلى null.');

    console.log('\n🎉 كفاءة التسكين والعزل 100%: كافة السيناريوهات اجتازت الفحص بنجاح تام.');
  } catch (error: any) {
    console.error('\n❌ فشل اختبار تسكين التفرعات:', (error instanceof Error ? error.message : String(error)) || error);
    process.exitCode = 1;
  } finally {
    console.log('\n=== [5] تنظيف بيانات الاختبار من قاعدة البيانات ===');
    try {
      const deleted = await prisma.product.deleteMany({
        where: { matCode: { in: dummyCodes } },
      });
      console.log(`- تم حذف المنتجات التجريبية (${deleted.count} منتج).`);
      console.log('✅ اكتمل التنظيف بنسبة 100%: قاعدة البيانات نظيفة ومطابقة لحالتها الأصلية.');
    } catch (cleanupError: any) {
      console.error('خطأ أثناء عملية التنظيف:', (cleanupError instanceof Error ? cleanupError.message : String(cleanupError)));
    } finally {
      await prisma.$disconnect();
    }
  }
}

testApplySubcategories();

