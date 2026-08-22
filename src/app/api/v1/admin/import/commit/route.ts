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

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = xlsx.utils.sheet_to_json(worksheet);

    if (records.length === 0) {
      return NextResponse.json({ error: 'الملف فارغ' }, { status: 400 });
    }

    // Process Categories
    const categoryPrefixes = new Set<string>();
    for (const record of records as any[]) {
      const code = String(record['الرمز'] || record['Code'] || record['الكود'] || '');
      if (code && code.length === 7) {
        categoryPrefixes.add(code.substring(0, 3));
      }
    }

    const categoryIdMap = new Map<string, number>();
    for (const prefix of Array.from(categoryPrefixes)) {
      const nameAr = CATEGORY_MAP[prefix] || `قسم ${prefix}`;
      const category = await prisma.category.upsert({
        where: { codePrefix: prefix },
        update: { nameAr },
        create: { codePrefix: prefix, nameAr },
      });
      categoryIdMap.set(prefix, category.id);
    }

    // Import Products
    const productsToCreate = [];
    const productsToUpdate = [];
    const existingProducts = await prisma.product.findMany({ select: { matCode: true } });
    const existingSet = new Set(existingProducts.map(p => p.matCode));

    for (const record of records as any[]) {
      const code = String(record['الرمز'] || record['Code'] || record['الكود'] || '');
      const name = String(record['الاسم'] || record['Name'] || record['اسم المادة'] || '');
      const priceStr = record['السعر الإفرادي'] || record['Price'] || record['السعر'];
      
      const rawPrice = Number(priceStr);
      const price = isNaN(rawPrice) ? 0 : rawPrice;
      
      if (!code || code.length !== 7) continue;

      const prefix = code.substring(0, 3);
      const categoryId = categoryIdMap.get(prefix);

      const isActive = price > 0; // zero price -> inactive

      if (existingSet.has(code)) {
        productsToUpdate.push({
          matCode: code,
          nameAr: name,
          price,
          categoryId,
          isActive
        });
      } else {
        productsToCreate.push({
          matCode: code,
          nameAr: name,
          price,
          categoryId,
          isActive
        });
      }
    }

    // SQLite can lock, so we use transaction sequentially or promise.all
    // For small batches, Prisma's transactions are fine.
    
    // Create new
    if (productsToCreate.length > 0) {
      await prisma.product.createMany({
        data: productsToCreate,
      });
    }

    // Update existing (Prisma doesn't have updateMany with different values per row easily in sqlite)
    // We update sequentially in chunks
    for (const product of productsToUpdate) {
      await prisma.product.update({
        where: { matCode: product.matCode },
        data: {
          nameAr: product.nameAr,
          price: product.price,
          categoryId: product.categoryId,
          isActive: product.isActive
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      imported: productsToCreate.length,
      updated: productsToUpdate.length 
    });

  } catch (error: any) {
    console.error('Commit error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ داخلي' }, { status: 500 });
  }
}
