import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'معرف المنتج غير صحيح' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم العثور على صورة' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save with the MatCode and Timestamp naming convention to allow multiple/future updates
    const timestamp = Date.now();
    const fileName = `${timestamp}.jpg`;
    
    // public/images/products directory path
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    const filePath = path.join(uploadDir, fileName);

    // Write file to public directory
    await writeFile(filePath, buffer);

    // Update product database record
    const imageUrl = `/images/products/${fileName}`;
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { mainImageUrl: imageUrl },
    });

    return NextResponse.json({ 
      success: true, 
      imageUrl: updatedProduct.mainImageUrl 
    });
    
  } catch (error: any) {
    console.error('Upload image error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء رفع الصورة' }, { status: 500 });
  }
}
