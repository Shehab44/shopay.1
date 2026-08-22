import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import prisma from '@/lib/db';

const CATEGORY_MAP: Record<string, string> = {
  '0101': 'أجهزة كهربائية وسخانات',
  '0102': 'مستلزمات كهربائية',
  '0103': 'أدوات منزلية ومطبخ',
  '0104': 'مستلزمات منزلية ونظافة صحية',
  '0105': 'أزياء وإكسسوارات رأس',
  '0106': 'ألعاب أطفال',
  '0107': 'مستحضرات تجميل وعناية',
  '0108': 'إكسسوارات شعر',
  '0109': 'مستلزمات أطفال',
  '0110': 'أحذية',
  '0111': 'طاقة وأجهزة إنفرتر',
  '0112': 'عدة وأدوات ورشة',
  '0113': 'أدوات تنظيف',
  '0114': 'جلديات وأدوات رياضية',
};

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
      return NextResponse.json({ error: 'الملف فارغ' }, { status: 400 });
    }

    // Process Categories
    const categoryPrefixes = new Set<string>();
    for (const record of records) {
      if (record.MatCode && record.MatCode.length >= 4) {
        categoryPrefixes.add(record.MatCode.substring(0, 4));
      }
    }

    const categoryIdMap = new Map<string, number>();
    for (const prefix of categoryPrefixes) {
      const nameAr = CATEGORY_MAP[prefix] || `قسم ${prefix}`;
      const category = await prisma.category.upsert({
        where: { codePrefix: prefix },
        update: { nameAr },
        create: { codePrefix: prefix, nameAr },
      });
      categoryIdMap.set(prefix, category.id);
    }

    // Process Products
    for (const record of records) {
      const matCode = record.MatCode;
      const prefix = matCode.substring(0, 4);
      const categoryId = categoryIdMap.get(prefix);

      const price = parseFloat(record.Price) || 0;
      const isActive = price > 0; // Hide 0-price products

      await prisma.product.upsert({
        where: { matCode },
        update: { 
          nameAr: record.ProductName, 
          categoryId,
          price,
          isActive
        },
        create: { 
          matCode, 
          nameAr: record.ProductName, 
          categoryId,
          price,
          isActive
        },
      });
    }

    return NextResponse.json({ success: true, processed: records.length });
  } catch (error: any) {
    console.error('Commit error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء حفظ التحديثات' }, { status: 500 });
  }
}
