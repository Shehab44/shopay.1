"use server";

import prisma from "@/lib/db";

export async function getMoreSearchResults({
  q,
  categoryFilter,
  minPrice,
  maxPrice,
  sort,
  page,
  limit = 24
}: {
  q: string;
  categoryFilter?: number;
  minPrice?: number;
  maxPrice?: number;
  sort: string;
  page: number;
  limit?: number;
}) {
  const skip = (page - 1) * limit;

  const words = q.split(/\s+/).filter(word => word.length > 0);
  const searchConditions = words.map(word => ({
    OR: [
      { nameAr: { contains: word } },
      { matCode: { contains: word } },
      { description: { contains: word } }
    ]
  }));

  const where: any = {
    isActive: true,
    stockQuantity: { gt: 0 },
  };

  if (searchConditions.length > 0) {
    where.AND = searchConditions;
  }

  if (categoryFilter) {
    where.categoryId = categoryFilter;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  let orderBy: any = { id: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { price: 'desc' };
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    take: limit,
    skip,
    orderBy
  });

  return products;
}
