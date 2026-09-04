'use server';

import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function getMoreProducts(
  q: string,
  noImage: boolean,
  skip: number,
  take: number = 30,
  categoryId?: number | null
) {
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
  if (categoryId) {
    where.categoryId = categoryId;
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

export async function updateProduct(id: number, data: any) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const updateData: any = {};
  if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ? parseInt(data.categoryId) : null;
  if (data.subCategoryLabel !== undefined) updateData.subCategoryLabel = data.subCategoryLabel ? data.subCategoryLabel.trim() : null;

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { category: true }
  });

  revalidatePath('/admin/products');
  return updated;
}
