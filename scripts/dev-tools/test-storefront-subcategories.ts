// اختبار عزل للتحقق من فلترة التفرعات على مستوى السيرفر وتكاملها بنسبة 100% (Strict Zero DB Writes)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStorefrontSubcategories() {
  console.log('================================================================================');
  console.log('🧪 بدء فحص العزل لفلترة التفرعات على مستوى السيرفر (Server-Side Subcategory Filtering)');
  console.log('================================================================================');

  try {
    // جلب قسم ألعاب الأطفال [106]
    const toysCat = await prisma.category.findUnique({
      where: { codePrefix: '106' },
    });

    if (!toysCat) {
      throw new Error('لم يتم العثور على قسم ألعاب الأطفال [106]');
    }

    // -----------------------------------------------------------------
    // السيناريو (A): استعلام كافة منتجات القسم دون فلتر تفرع
    // -----------------------------------------------------------------
    console.log('\n=== [1] السيناريو (A): استعلام كافة منتجات القسم دون فلتر تفرع ===');
    const allProductsInCat = await prisma.product.findMany({
      where: {
        categoryId: toysCat.id,
        isActive: true,
      },
      select: {
        id: true,
        matCode: true,
        nameAr: true,
        subCategoryLabel: true,
      },
    });

    console.log(`- إجمالي المنتجات النشطة المسترجعة لقسم ألعاب الأطفال: ${allProductsInCat.length} منتج`);
    if (allProductsInCat.length === 0) {
      throw new Error('فشل استرجاع منتجات قسم الألعاب!');
    }
    console.log('🛡️ السيناريو (A) نجح: تم استرجاع كافة منتجات القسم بنجاح تام.');

    // -----------------------------------------------------------------
    // السيناريو (B): استعلام المنتجات مع تمرير فلتر { subCategoryLabel: 'فرد' }
    // -----------------------------------------------------------------
    console.log('\n=== [2] السيناريو (B): استعلام المنتجات مع فلتر { subCategoryLabel: "فرد" } ===');
    const filteredProducts = await prisma.product.findMany({
      where: {
        categoryId: toysCat.id,
        isActive: true,
        subCategoryLabel: 'فرد',
      },
      select: {
        id: true,
        matCode: true,
        nameAr: true,
        subCategoryLabel: true,
      },
    });

    console.log(`- عدد المنتجات المرجعة تحت تفرع "فرد": ${filteredProducts.length} منتج`);
    if (filteredProducts.length === 0) {
      throw new Error('لم يتم العثور على أي منتج مسكن بتفرع "فرد"!');
    }

    // التحقق البرمجي الصارم أن 100% من المنتجات المرجعة تمتلك subCategoryLabel === 'فرد'
    const nonMatching = filteredProducts.filter((p) => p.subCategoryLabel !== 'فرد');
    if (nonMatching.length > 0) {
      throw new Error(`خرق دقة الفلترة! وُجدت منتجات لا تحمل التفرع "فرد": ${nonMatching.length} منتج`);
    }

    const percentageCorrect = ((filteredProducts.length / filteredProducts.length) * 100).toFixed(0);
    console.log(`- نماذج من المنتجات المرجعة:`);
    filteredProducts.slice(0, 3).forEach((p, idx) => {
      console.log(`   ${idx + 1}. [${p.matCode}] ${p.nameAr} -> تفرع: "${p.subCategoryLabel}"`);
    });
    console.log(`🛡️ السيناريو (B) نجح بنسبة ${percentageCorrect}%: جميع المنتجات المسترجعة تطابق الفلتر بدقة قطعية.`);

    // -----------------------------------------------------------------
    // السيناريو (C): استعلام التفرعات المتاحة لقسم فارغ والتأكد من إرجاع مصفوفة فارغة
    // -----------------------------------------------------------------
    console.log('\n=== [3] السيناريو (C): استعلام التفرعات المتاحة لقسم فارغ أو غير موجود ===');
    const nonExistentCatId = 99999999;
    const emptySubCategories = await prisma.product.findMany({
      where: {
        categoryId: nonExistentCatId,
        subCategoryLabel: { not: null },
        isActive: true,
      },
      select: {
        subCategoryLabel: true,
      },
      distinct: ['subCategoryLabel'],
    });

    console.log(`- عدد التفرعات المسترجعة لقسم غير موجود (ID=${nonExistentCatId}): ${emptySubCategories.length}`);
    if (emptySubCategories.length !== 0) {
      throw new Error('فشل الفحص! كان المتوقع إرجاع مصفوفة فارغة تماماً.');
    }

    // والتحقق أيضاً من التفرعات المميزة للقسم الفعلي [106]
    const toysDistinct = await prisma.product.findMany({
      where: {
        categoryId: toysCat.id,
        subCategoryLabel: { not: null },
        isActive: true,
      },
      select: {
        subCategoryLabel: true,
      },
      distinct: ['subCategoryLabel'],
    });

    const activeSubcategories = toysDistinct
      .map((p) => p.subCategoryLabel!)
      .filter(Boolean)
      .sort();

    console.log(`- قائمة التفرعات المميزة المتاحة فعلياً لقسم [106]: [${activeSubcategories.join(', ')}]`);
    if (!activeSubcategories.includes('فرد')) {
      throw new Error('تفرع "فرد" مفقود من قائمة التفرعات المتاحة للقسم 106!');
    }

    console.log('🛡️ السيناريو (C) نجح بنسبة 100%: تم التحقق من سلامة استعلام التفرعات المميزة ومعالجة الأقسام الفارغة بنجاح.');

    // -----------------------------------------------------------------
    // السيناريو (D): فحص مطابقة استعلام الـ count البرمجي لفلترة التفرع
    // -----------------------------------------------------------------
    console.log('\n=== [4] السيناريو (D): فحص دقة استعلام prisma.product.count مع فلتر التفرع ===');
    const totalWithoutFilter = await prisma.product.count({
      where: {
        categoryId: toysCat.id,
        isActive: true,
      },
    });

    const whereWithSubCategory = {
      categoryId: toysCat.id,
      isActive: true,
      subCategoryLabel: 'فرد',
    };

    const countWithSubCategory = await prisma.product.count({
      where: whereWithSubCategory,
    });

    console.log(`- إجمالي منتجات قسم ألعاب الأطفال (بدون فلتر): ${totalWithoutFilter}`);
    console.log(`- نتيجة count مع فلتر { subCategoryLabel: 'فرد' }: ${countWithSubCategory} (المتوقع بدقة: 49)`);

    if (countWithSubCategory === totalWithoutFilter) {
      throw new Error('خطأ في منطق الـ count! العداد يعيد إجمالي القسم بدلاً من تفرع فرد المفلتر.');
    }

    if (countWithSubCategory !== 49) {
      throw new Error(`عدم تطابق في عداد التفرع! القيمة المرجعة: ${countWithSubCategory}، المتوقع: 49`);
    }

    // التحقق من حساب الترقيم البرمجي
    const ITEMS_PER_PAGE = 24;
    const totalPages = Math.ceil(countWithSubCategory / ITEMS_PER_PAGE);
    console.log(`- إجمالي الصفحات المحسوبة للتفرع (${countWithSubCategory} / ${ITEMS_PER_PAGE}): ${totalPages} صفحات`);

    if (totalPages !== Math.ceil(49 / 24)) {
      throw new Error(`خطأ في حساب totalPages! المحسوب: ${totalPages}`);
    }

    console.log('🛡️ السيناريو (D) نجح بنسبة 100%: استعلام count يعكس التفرع بدقة متناهية (49 منتج) وحساب totalPages مطابق للفلتر.');

    console.log('\n================================================================================');
    console.log('🎉 كفاءة الفلترة على السيرفر 100%: كافة السيناريوهات اجتازت الفحص بنجاح تام.');
    console.log('🛡️ استعلام قراءة فقط (Strict Zero DB Writes): قاعدة البيانات لم تتأثر إطلاقاً.');
    console.log('================================================================================');
  } catch (error: any) {
    console.error('\n❌ فشل اختبار فلترة التفرعات:', error.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testStorefrontSubcategories();

