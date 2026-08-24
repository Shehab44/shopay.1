'use server';

import prisma from '@/lib/db';

export async function getMoreProducts(q: string, noImage: boolean, skip: number, take: number = 30) {
  const where: any = {};
  if (q) {
    where.OR = [
      { nameAr: { contains: q } },
      { matCode: { contains: q } },
    ];
  }
  if (noImage) {
    where.mainImageUrl = null;
  }
  
  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    skip,
    take,
    orderBy: { id: 'desc' },
  });
  
  return products;
}
