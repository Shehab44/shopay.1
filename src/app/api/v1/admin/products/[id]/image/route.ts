/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth-guard';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Fail Closed: Check Cloudinary Environment Variables
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json(
        { error: 'Server configuration error: Cloudinary keys missing' },
        { status: 500 }
      );
    }

    // 1. Verify Authentication & RBAC (Defense-in-Depth)
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    // 2. Validate Product
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'معرف المنتج غير صحيح' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    // 3. Extract File from Request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم العثور على صورة' }, { status: 400 });
    }

    // Strict Size Validation (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Strict MIME Type Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Convert to Base64 and upload (More reliable than upload_stream to prevent 499 Request Timeout)
    const base64Data = buffer.toString("base64");
    const mimeType = file.type;
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'shopay/products',
      public_id: `${product.matCode}_${Date.now()}`,
      overwrite: true,
      timeout: 120000 // 120 seconds to prevent hanging
    });

    // 5. Save uploaded image to ProductImage table (Gallery)
    await prisma.productImage.create({
      data: {
        url: uploadResult.secure_url,
        productId: id,
      }
    });

    // 6. Backward Compatibility: Set mainImageUrl only if it's currently null
    if (!product.mainImageUrl) {
      await prisma.product.update({
        where: { id },
        data: { mainImageUrl: uploadResult.secure_url },
      });
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: uploadResult.secure_url 
    });
    
  } catch (error: any) {
    console.error('Upload image error:', error);

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة لاحقاً أو الاتصال بالدعم.' }, { status: 500 });
    }

    return NextResponse.json({ 
      error: (error instanceof Error ? error.message : String(error)) || 'حدث خطأ أثناء رفع الصورة',
      stack: (error instanceof Error ? error.stack : String(error)) 
    }, { status: 500 });
  }
}
