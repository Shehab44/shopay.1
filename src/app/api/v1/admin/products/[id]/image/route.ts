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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Convert to Base64 and upload (More reliable than upload_stream to prevent 499 Request Timeout)
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'shopay/products',
      public_id: `${product.matCode}_${Date.now()}`,
      overwrite: true,
      timeout: 120000 // 120 seconds to prevent hanging
    });

    // 5. Delete Old Image from Cloudinary (if exists)
    if (product.mainImageUrl && product.mainImageUrl.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234/shopay/products/code_123.jpg
        const urlParts = product.mainImageUrl.split('/');
        const folderIndex = urlParts.findIndex(part => part === 'shopay');
        
        if (folderIndex !== -1) {
          const publicIdWithExt = urlParts.slice(folderIndex).join('/');
          const publicId = publicIdWithExt.split('.')[0]; // remove extension
          
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted old image from Cloudinary: ${publicId}`);
        }
      } catch (delErr) {
        console.error("Failed to delete old image from Cloudinary:", delErr);
        // We don't throw here to ensure the update process finishes successfully.
      }
    }

    // 6. Update Database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { mainImageUrl: uploadResult.secure_url },
    });

    return NextResponse.json({ 
      success: true, 
      imageUrl: updatedProduct.mainImageUrl 
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
