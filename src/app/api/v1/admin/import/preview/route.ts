import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم العثور على ملف' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as any);
    } catch (e) {
      return NextResponse.json({ error: 'صيغة الملف غير مدعومة. يرجى رفع ملف Excel (xlsx).' }, { status: 400 });
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json({ error: 'الملف فارغ أو لا يحتوي على صفحات' }, { status: 400 });
    }

    const records: Record<string, any>[] = [];
    let headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value?.toString().trim() || `Column${colNumber}`;
        });
      } else {
        const record: Record<string, any> = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            record[header] = cell.value;
          }
        });
        // Only push if it has some data
        if (Object.keys(record).length > 0) {
            records.push(record);
        }
      }
    });

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
