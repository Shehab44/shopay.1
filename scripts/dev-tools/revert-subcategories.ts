// أداة تراجع فوري لتصفير حقل subCategoryLabel لجميع المنتجات دون المساس بنظام الأقسام الرئيسي categoryId

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function revertSubcategories() {
  console.log('بدء التراجع وتصفير حقل subCategoryLabel لجميع المنتجات...');

  const result = await prisma.product.updateMany({
    where: {
      subCategoryLabel: {
        not: null,
      },
    },
    data: {
      subCategoryLabel: null,
    },
  });

  console.log(`تم التراجع وتصفير الحقل بنجاح. عدد السجلات التي تم تصفيرها: ${result.count}`);
  return result.count;
}

if (require.main === module) {
  revertSubcategories()
    .catch((e) => {
      console.error('خطأ أثناء التراجع:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
