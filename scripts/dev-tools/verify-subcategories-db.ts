// أداة تدقيق وتوثيق عدادات التفرعات في قاعدة البيانات بنسبة 100% (Strict Zero DB Writes)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySubcategoriesDb() {
  console.log('================================================================================');
  console.log('📊 تقرير تدقيق عدادات التفرعات بقاعدة البيانات (Database Verification Report)');
  console.log('================================================================================');

  // 1. الإحصائيات العامة لجدول Product
  const totalProducts = await prisma.product.count();
  const populatedProducts = await prisma.product.count({
    where: { subCategoryLabel: { not: null } },
  });
  const unpopulatedProducts = await prisma.product.count({
    where: { subCategoryLabel: null },
  });

  const overallCoveragePct = totalProducts > 0
    ? ((populatedProducts / totalProducts) * 100).toFixed(1)
    : '0.0';

  console.log(`- إجمالي المنتجات الكلي في جدول Product: ${totalProducts.toLocaleString()} منتج`);
  console.log(`- عدد المنتجات المسكنة (subCategoryLabel !== null): ${populatedProducts.toLocaleString()} منتج (${overallCoveragePct}%)`);
  console.log(`- عدد المنتجات العامة (subCategoryLabel === null): ${unpopulatedProducts.toLocaleString()} منتج`);
  console.log('--------------------------------------------------------------------------------');

  // 2. تفصيل العدادات ونسب التغطية للأقسام الـ 14
  const categories = await prisma.category.findMany({
    orderBy: { codePrefix: 'asc' },
    include: {
      products: {
        select: {
          id: true,
          subCategoryLabel: true,
        },
      },
    },
  });

  console.log('جدول التوزيع التفصيلي للأقسام الـ 14:');
  console.log('--------------------------------------------------------------------------------');
  console.log(
    'الكود'.padEnd(6) +
    'اسم القسم'.padEnd(32) +
    'الإجمالي'.padEnd(10) +
    'المسكن'.padEnd(10) +
    'النسبة'.padEnd(10) +
    'بدون تفرع'
  );
  console.log('--------------------------------------------------------------------------------');

  for (const cat of categories) {
    const totalCat = cat.products.length;
    const populatedCat = cat.products.filter((p) => p.subCategoryLabel !== null).length;
    const unpopulatedCat = totalCat - populatedCat;
    const pct = totalCat > 0 ? ((populatedCat / totalCat) * 100).toFixed(1) + '%' : '0.0%';

    console.log(
      `[${cat.codePrefix}]`.padEnd(6) +
      cat.nameAr.padEnd(32) +
      totalCat.toString().padEnd(10) +
      populatedCat.toString().padEnd(10) +
      pct.padEnd(10) +
      unpopulatedCat.toString()
    );
  }

  console.log('================================================================================');
  console.log('🛡️ استعلام قراءة فقط (Strict Zero DB Writes): لم يتم إجراء أي تعديل على قاعدة البيانات.');
  console.log('================================================================================\n');

  return {
    totalProducts,
    populatedProducts,
    unpopulatedProducts,
    overallCoveragePct,
  };
}

if (require.main === module) {
  verifySubcategoriesDb()
    .catch((err) => {
      console.error('خطأ أثناء فحص قاعدة البيانات:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
