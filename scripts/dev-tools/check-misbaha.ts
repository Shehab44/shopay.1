import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findFirst({
    where: { nameAr: 'إكسسوارات شعر' },
    include: {
      products: {
        where: {
          nameAr: {
            contains: 'مسبحة'
          }
        },
        select: { nameAr: true }
      }
    }
  });

  if (category) {
    console.log('أمثلة لمنتجات تحتوي كلمة "مسبحة" في قسم إكسسوارات شعر:');
    category.products.forEach(p => console.log(`- ${p.nameAr}`));
  } else {
    console.log('القسم غير موجود.');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

