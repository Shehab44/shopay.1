import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم العثور على ملف' }, { status: 400 });
    }

    const text = await file.text();
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, any>[];

    if (records.length === 0) {
      return NextResponse.json({ error: 'الملف فارغ أو لا يحتوي على بيانات صالحة' }, { status: 400 });
    }

    // Verify required columns
    const firstRow = records[0] as Record<string, any>;
    if (!firstRow.MatCode || !firstRow.ProductName || !firstRow.Price) {
      return NextResponse.json({ 
        error: 'الملف ينقصه أعمدة أساسية. يجب أن يحتوي على MatCode, ProductName, Price' 
      }, { status: 400 });
    }

    // Group by MatCode just to count unique products
    const uniqueMatCodes = new Set(records.map((r: any) => r.MatCode));
    
    // Fetch existing products to compare
    const existingProductsCount = await prisma.product.count({
      where: { matCode: { in: Array.from(uniqueMatCodes) as string[] } }
    });

    const newProducts = uniqueMatCodes.size - existingProductsCount;
    // In a real advanced preview, we'd compare prices exactly. For now, we estimate based on records length.
    const updatedPrices = records.length; 

    return NextResponse.json({
      totalRows: records.length,
      updatedPrices: existingProductsCount > 0 ? updatedPrices : 0, // Simplified for demo
      newProducts: newProducts > 0 ? newProducts : 0,
      errors: [],
    });

  } catch (error: any) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
