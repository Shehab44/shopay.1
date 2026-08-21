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
    });

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

    // Process Products and Units
    const skippedRecords: { matCode: string, barcode10: string }[] = [];
    const productsMap = new Map<string, any[]>();
    
    for (const record of records) {
      const matCode = record.MatCode;
      const barcode10 = record.Barcode10;

      // Validate 10-digit barcode
      if (!/^\d{10}$/.test(barcode10)) {
        console.log(`Rejecting invalid barcode: ${barcode10} (MatCode: ${matCode})`);
        skippedRecords.push({ matCode, barcode10 });
        continue;
      }

      if (!productsMap.has(matCode)) {
        productsMap.set(matCode, []);
      }
      productsMap.get(matCode)!.push(record);
    }

    // Let's use a transaction if possible, or just sequential updates
    for (const [matCode, variants] of productsMap.entries()) {
      const firstVariant = variants[0];
      const prefix = matCode.substring(0, 4);
      const categoryId = categoryIdMap.get(prefix);

      const product = await prisma.product.upsert({
        where: { matCode },
        update: { nameAr: firstVariant.ProductName, categoryId },
        create: { matCode, nameAr: firstVariant.ProductName, categoryId },
      });

      let minRate = Infinity;
      for (const v of variants) {
        const rate = parseInt(v.UnitRate, 10);
        if (rate < minRate) minRate = rate;
      }

      for (const v of variants) {
        const barcode10 = v.Barcode10;
        const unitRate = parseInt(v.UnitRate, 10);
        const isDefault = unitRate === minRate;
        const price = parseFloat(v.Price);

        await prisma.productUnit.upsert({
          where: { barcode10 },
          update: { unitName: v.UnitName, unitRate, price, isDefaultUnit: isDefault },
          create: { barcode10, unitName: v.UnitName, unitRate, price, isDefaultUnit: isDefault, productId: product.id },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: records.length - skippedRecords.length,
      skippedRecords: {
        count: skippedRecords.length,
        records: skippedRecords
      }
    });
  } catch (error: any) {
    console.error('Commit error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء حفظ التحديثات' }, { status: 500 });
  }
}
