import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم العثور على ملف' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let workbook;
    try {
      workbook = xlsx.read(buffer, { type: 'buffer' });
    } catch (e) {
      return NextResponse.json({ error: 'صيغة الملف غير مدعومة. يرجى رفع ملف Excel (xlsx).' }, { status: 400 });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = xlsx.utils.sheet_to_json(worksheet) as Record<string, any>[];

    if (records.length === 0) {
      return NextResponse.json({ error: 'الملف فارغ أو لا يحتوي على بيانات صالحة' }, { status: 400 });
    }

    // Verify required columns
    const firstRow = records[0];
    const expectedColumns = ['الرمز', 'الاسم', 'السعر الإفرادي'];
    
    // Check if the keys exist
    const hasColumns = expectedColumns.every(col => Object.keys(firstRow).some(key => key.trim() === col));
    
    if (!hasColumns) {
      return NextResponse.json({ 
        error: `الملف ينقصه أعمدة أساسية. الأعمدة المطلوبة: ${expectedColumns.join(', ')}` 
      }, { status: 400 });
    }

    const errors: string[] = [];
    const uniqueMatCodes = new Set<string>();

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const matCodeKey = Object.keys(record).find(k => k.trim() === 'الرمز')!;
      let matCode = record[matCodeKey];
      if (matCode) {
        matCode = matCode.toString().trim();
        if (matCode.length !== 7) {
          errors.push(`السطر ${i + 2}: الرمز "${matCode}" يجب أن يتكون من 7 خانات بالضبط.`);
        } else {
          uniqueMatCodes.add(matCode);
        }
      }
    }

    // Fetch existing products to compare
    const existingProductsCount = await prisma.product.count({
      where: { matCode: { in: Array.from(uniqueMatCodes) } }
    });

    const newProducts = uniqueMatCodes.size - existingProductsCount;
    const updatedPrices = existingProductsCount > 0 ? records.length : 0; 

    return NextResponse.json({
      totalRows: records.length,
      updatedPrices,
      newProducts,
      errors: errors.slice(0, 5), // Return top 5 errors max for preview
    });

  } catch (error: any) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
