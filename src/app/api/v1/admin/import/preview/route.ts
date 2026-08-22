import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم العثور على ملف' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = xlsx.utils.sheet_to_json(worksheet);

    if (records.length === 0) {
      return NextResponse.json({ error: 'الملف فارغ' }, { status: 400 });
    }

    // Process Categories (first 3 digits of matCode)
    const categoryPrefixes = new Set<string>();
    const validRecords = [];
    let updatedPrices = 0;
    let newProducts = 0;
    const errors: string[] = [];

    // existing products map for quick check
    const existingProducts = await prisma.product.findMany({ select: { matCode: true, price: true } });
    const productMap = new Map(existingProducts.map(p => [p.matCode, p.price]));

    for (const record of records as any[]) {
      const code = String(record['الرمز'] || record['Code'] || record['الكود'] || '');
      const priceStr = record['السعر الإفرادي'] || record['Price'] || record['السعر'];
      
      const rawPrice = Number(priceStr);
      const price = isNaN(rawPrice) ? 0 : rawPrice;

      if (!code || code.length !== 7) {
        errors.push(`كود غير صالح: ${code} - يجب أن يكون 7 خانات`);
        continue;
      }

      const prefix = code.substring(0, 3);
      categoryPrefixes.add(prefix);
      
      if (productMap.has(code)) {
        if (productMap.get(code) !== price) {
          updatedPrices++;
        }
      } else {
        newProducts++;
      }
      
      validRecords.push({
        code,
        price
      });
    }

    return NextResponse.json({
      totalRows: validRecords.length,
      updatedPrices,
      newProducts,
      errors: errors.slice(0, 20), // limit errors returned
    });

  } catch (error: any) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ داخلي' }, { status: 500 });
  }
}
