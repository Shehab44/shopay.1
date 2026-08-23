import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import prisma from '@/lib/db';

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
      return NextResponse.json({ error: 'الملف فارغ' }, { status: 400 });
    }

    // Process Categories
    const categoryPrefixes = new Set<string>();
    for (const record of records) {
      const matCodeKey = Object.keys(record).find(k => k.trim() === 'الرمز');
      if (matCodeKey) {
        let matCode = record[matCodeKey]?.toString().trim();
        if (matCode && matCode.length === 7) {
          categoryPrefixes.add(matCode.substring(0, 3));
        }
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
    let processed = 0;
    for (const record of records) {
      const matCodeKey = Object.keys(record).find(k => k.trim() === 'الرمز');
      const nameKey = Object.keys(record).find(k => k.trim() === 'الاسم');
      const priceKey = Object.keys(record).find(k => k.trim() === 'السعر الإفرادي');

      if (!matCodeKey || !nameKey || !priceKey) continue;

      const matCode = record[matCodeKey]?.toString().trim();
      const productName = record[nameKey]?.toString().trim();
      
      if (!matCode || matCode.length !== 7) continue;

      const prefix = matCode.substring(0, 3);
      const categoryId = categoryIdMap.get(prefix);

      const price = parseFloat(record[priceKey]) || 0;
      const isActive = price > 0; // Hide 0-price products

      await prisma.product.upsert({
        where: { matCode },
        update: { 
          nameAr: productName, 
          categoryId,
          price,
          isActive
        },
        create: { 
          matCode, 
          nameAr: productName, 
          categoryId,
          price,
          isActive
        },
      });
      processed++;
    }

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    console.error('Commit error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء حفظ التحديثات' }, { status: 500 });
  }
}
