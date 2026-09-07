/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth-guard';

const CATEGORY_MAP: Record<string, string> = {
  '101': 'أجهزة كهربائية وسخانات',
  '102': 'مستلزمات كهربائية',
  '103': 'أدوات منزلية ومطبخ',
  '104': 'مستلزمات منزلية ونظافة صحية',
  '105': 'أزياء وإكسسوارات رأس',
  '106': 'ألعاب أطفال',
  '107': 'مستحضرات تجميل وعناية',
  '108': 'إكسسوارات شعر',
  '109': 'مستلزمات أطفال',
  '110': 'أحذية',
  '111': 'طاقة وأجهزة إنفرتر',
  '112': 'عدة وأدوات ورشة',
  '113': 'أدوات تنظيف',
  '114': 'جلديات وأدوات رياضية',
};

export async function POST(request: Request) {
  try {
    // 1. Defense-in-Depth: RBAC Check
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    // 2. Extract & Parse File
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
    } catch {
      return NextResponse.json({ error: 'صيغة الملف غير مدعومة. يرجى رفع ملف Excel (xlsx).' }, { status: 400 });
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json({ error: 'الملف فارغ أو لا يحتوي على صفحات' }, { status: 400 });
    }

    const records: { record: Record<string, any>; rowNumber: number }[] = [];
    const headers: string[] = [];

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
        const hasValues = Object.values(record).some(
          val => val !== null && val !== undefined && val.toString().trim() !== ''
        );
        if (hasValues) {
          records.push({ record, rowNumber });
        }
      }
    });

    if (records.length === 0) {
      return NextResponse.json({ error: 'الملف فارغ' }, { status: 400 });
    }

    // 3. Strict Pre-Validation: Validate all rows before performing ANY database modification
    const validatedProducts: {
      rowNumber: number;
      matCode: string;
      productName: string;
      price: number;
      prefix: string;
    }[] = [];

    const categoryPrefixes = new Set<string>();

    for (const { record, rowNumber } of records) {
      const matCodeKey = Object.keys(record).find(k => k.trim() === 'الرمز');
      const nameKey = Object.keys(record).find(k => k.trim() === 'الاسم');
      const priceKey = Object.keys(record).find(k => k.trim() === 'السعر الإفرادي');

      if (!matCodeKey || !nameKey || !priceKey) {
        return NextResponse.json({
          error: `أعمدة الملف غير مكتملة في السطر ${rowNumber}. الأعمدة المطلوبة: الرمز، الاسم، السعر الإفرادي.`
        }, { status: 400 });
      }

      const rawMatCode = record[matCodeKey];
      const rawName = record[nameKey];
      const rawPrice = record[priceKey];

      // Validate matCode: exactly 7 digits
      const matCode = rawMatCode?.toString().trim();
      if (!matCode || !/^\d{7}$/.test(matCode)) {
        return NextResponse.json({
          error: `رمز المادة غير صالح في السطر ${rowNumber}: "${rawMatCode || ''}". يجب أن يتكون الرمز من 7 أرقام.`
        }, { status: 400 });
      }

      // Validate productName: non-empty string
      const productName = rawName?.toString().trim();
      if (!productName) {
        return NextResponse.json({
          error: `اسم المنتج مفقود في السطر ${rowNumber}.`
        }, { status: 400 });
      }

      // Validate price: required non-negative number
      if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
        return NextResponse.json({
          error: `السعر الإفرادي مفقود في السطر ${rowNumber}.`
        }, { status: 400 });
      }

      const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(',', '.'));
      if (isNaN(price) || price < 0) {
        return NextResponse.json({
          error: `السعر الإفرادي غير صالح في السطر ${rowNumber}: "${rawPrice}". يجب أن يكون رقماً غير سالب.`
        }, { status: 400 });
      }

      const prefix = matCode.substring(0, 3);
      categoryPrefixes.add(prefix);

      validatedProducts.push({
        rowNumber,
        matCode,
        productName,
        price,
        prefix,
      });
    }

    // 4. All-or-Nothing Atomic Execution: Single synchronized transaction with automatic rollback and extended timeout
    let processed = 0;
    await prisma.$transaction(
      async (tx) => {
        // Upsert Categories atomically
        const categoryIdMap = new Map<string, number>();
        for (const prefix of categoryPrefixes) {
          const nameAr = CATEGORY_MAP[prefix] || `قسم ${prefix}`;
          const category = await tx.category.upsert({
            where: { codePrefix: prefix },
            update: { nameAr },
            create: { codePrefix: prefix, nameAr },
          });
          categoryIdMap.set(prefix, category.id);
        }

        // Upsert Products atomically
        for (const item of validatedProducts) {
          const categoryId = categoryIdMap.get(item.prefix);
          const isActive = item.price > 0;

          await tx.product.upsert({
            where: { matCode: item.matCode },
            update: { 
              nameAr: item.productName, 
              categoryId,
              price: item.price,
              isActive
            },
            create: { matCode: item.matCode, nameAr: item.productName, categoryId, price: item.price, isActive, stockQuantity: 9999 },
          });
          processed++;
        }
      },
      {
        maxWait: 10000,
        timeout: 60000,
      }
    );

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    console.error('Commit error:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'حدث خطأ أثناء حفظ التحديثات' }, { status: 400 });
  }
}
