import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: { subCategoryLabel: 'مسبحة' },
    data: { subCategoryLabel: null }
  });
  console.log('Removed مسبحة from subcategories successfully');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

