/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function getMoreProducts(
  q: string,
  noImage: boolean,
  skip: number,
  take: number = 30,
  categoryId?: number | null
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    throw new Error('Unauthorized: Admin access required');
  }

  const where: Record<string, any> = {};
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
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    throw new Error('Unauthorized: Admin access required');
  }

  const updateData: Record<string, any> = {};
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

