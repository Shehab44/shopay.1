import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

// The path to the CSV file based on the project structure
const CSV_FILE_PATH = path.join(process.cwd(), '../shopay_products.csv');

// We also have to handle categories as described in the prompt
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

async function main() {
  console.log('Starting import...');
  
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`CSV file not found at: ${CSV_FILE_PATH}`);
    process.exit(1);
  }

  const records: any[] = [];
  const parser = fs.createReadStream(CSV_FILE_PATH).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }
  
  console.log(`Parsed ${records.length} records from CSV.`);

  // 1. Extract Categories and save them
  const categoryPrefixes = new Set<string>();
  for (const record of records) {
    const matCode = record.MatCode;
    if (matCode && matCode.length >= 4) {
      categoryPrefixes.add(matCode.substring(0, 4));
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
  
  console.log(`Ensured ${categoryIdMap.size} categories.`);

  // 2. Group records by MatCode
  const productsMap = new Map<string, any[]>();
  for (const record of records) {
    const matCode = record.MatCode;
    if (!productsMap.has(matCode)) {
      productsMap.set(matCode, []);
    }
    productsMap.get(matCode)!.push(record);
  }

  console.log(`Found ${productsMap.size} unique products.`);

  // 3. Import Products and their Units
  let productsCreated = 0;
  let unitsCreated = 0;

  for (const [matCode, variants] of productsMap.entries()) {
    // Get the first variant to extract common product details
    const firstVariant = variants[0];
    const prefix = matCode.substring(0, 4);
    const categoryId = categoryIdMap.get(prefix);

    // Upsert Product
    const product = await prisma.product.upsert({
      where: { matCode },
      update: {
        nameAr: firstVariant.ProductName,
        categoryId: categoryId,
      },
      create: {
        matCode,
        nameAr: firstVariant.ProductName,
        categoryId: categoryId,
      },
    });
    productsCreated++;

    // Process units
    // Determine the default unit (the one with the smallest UnitRate, usually 1)
    let minRate = Infinity;
    for (const v of variants) {
      const rate = parseInt(v.UnitRate, 10);
      if (rate < minRate) {
        minRate = rate;
      }
    }

    for (const v of variants) {
      const barcode10 = v.Barcode10;
      const unitRate = parseInt(v.UnitRate, 10);
      const isDefault = unitRate === minRate;

      await prisma.productUnit.upsert({
        where: { barcode10 },
        update: {
          unitName: v.UnitName,
          unitRate: unitRate,
          price: parseFloat(v.Price),
          isDefaultUnit: isDefault,
          productId: product.id,
          // stockQuantity will be 0 by default, which is fine for initial import
        },
        create: {
          barcode10,
          unitName: v.UnitName,
          unitRate: unitRate,
          price: parseFloat(v.Price),
          isDefaultUnit: isDefault,
          productId: product.id,
        },
      });
      unitsCreated++;
    }
  }

  console.log('\n--- Import Report ---');
  console.log(`Categories processed: ${categoryIdMap.size}`);
  console.log(`Products processed: ${productsCreated}`);
  console.log(`Product Units processed: ${unitsCreated}`);
  console.log('Import completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
