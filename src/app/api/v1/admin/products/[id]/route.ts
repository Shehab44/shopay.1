import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'معرف منتج غير صالح' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Admin get product error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب بيانات المنتج' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'معرف منتج غير صالح' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.nameAr !== undefined) updateData.nameAr = body.nameAr;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.stockQuantity !== undefined) updateData.stockQuantity = parseInt(body.stockQuantity);

    // 1. Validate and update categoryId if provided
    if (body.categoryId !== undefined) {
      if (body.categoryId === null || body.categoryId === '') {
        updateData.categoryId = null;
      } else {
        const catId = parseInt(body.categoryId);
        if (isNaN(catId)) {
          return NextResponse.json({ error: 'معرف القسم غير صالح' }, { status: 400 });
        }
        const categoryExists = await prisma.category.findUnique({ where: { id: catId } });
        if (!categoryExists) {
          return NextResponse.json({ error: 'القسم المحدد غير موجود' }, { status: 400 });
        }
        updateData.categoryId = catId;
      }
    }

    // 2. Validate and update subCategoryLabel if provided
    if (body.subCategoryLabel !== undefined) {
      if (body.subCategoryLabel === null || body.subCategoryLabel.trim() === '') {
        updateData.subCategoryLabel = null;
      } else {
        updateData.subCategoryLabel = body.subCategoryLabel.trim();
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Admin update product error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث المنتج' }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'معرف منتج غير صالح' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error: any) {
    console.error('Admin delete product error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف المنتج' }, { status: 500 });
  }
}
