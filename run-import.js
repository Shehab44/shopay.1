const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const fs = require('fs');

const prisma = new PrismaClient();

const CATEGORY_MAP = {
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

async function main() {
  const filePath = 'data excel/new data.xlsx';

  if (!fs.existsSync(filePath)) {
    console.error("File not found!");
    process.exit(1);
  }

  console.log("Reading Excel file...");
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  console.log(`Found ${data.length} rows.`);

  // 1. Delete all old products (and wishlist, order items cascaded or handled)
  console.log("Deleting old products...");
  await prisma.product.deleteMany({});
  
  // Also clean old categories if we want to ensure only the 14 exist, but better just leave them or upsert.
  // Wait, let's just delete categories too to be perfectly clean? No, let's keep and update them.

  // Process Categories
  const categoryPrefixes = new Set();
  for (const row of data) {
    const code = String(row['الرمز'] || row['Code'] || row['الكود'] || '');
    if (code.length === 7) {
      categoryPrefixes.add(code.substring(0, 3));
    }
  }

  const categoryIdMap = new Map();
  console.log("Upserting Categories...");
  for (const prefix of categoryPrefixes) {
    const nameAr = CATEGORY_MAP[prefix] || `قسم ${prefix}`;
    const category = await prisma.category.upsert({
      where: { codePrefix: prefix },
      update: { nameAr },
      create: { codePrefix: prefix, nameAr },
    });
    categoryIdMap.set(prefix, category.id);
  }

  console.log("Importing Products...");
  
  let newProductsCount = 0;
  let inactiveProductsCount = 0;

  // Since SQLite has limits on how many records can be created in a single transaction,
  // we use a loop to insert them one by one or in small batches.
  // We'll use a chunking approach.
  
  const productsToCreate = data.map(row => {
    const code = String(row['الرمز'] || row['Code'] || row['الكود']);
    const name = String(row['الاسم'] || row['Name'] || row['اسم المادة']);
    const priceStr = row['السعر الإفرادي'] || row['Price'] || row['السعر'];
    
    // Explicitly check if price is 0
    const rawPrice = Number(priceStr);
    const price = isNaN(rawPrice) ? 0 : rawPrice;
    
    const prefix = code.length === 7 ? code.substring(0, 3) : '';
    const categoryId = categoryIdMap.get(prefix);

    const isActive = price > 0;

    return {
      matCode: code,
      nameAr: name,
      price: price,
      categoryId: categoryId || null,
      isActive: isActive,
    };
  }).filter(p => p.matCode);

  const chunkSize = 500;
  for (let i = 0; i < productsToCreate.length; i += chunkSize) {
    const chunk = productsToCreate.slice(i, i + chunkSize);
    await prisma.product.createMany({
      data: chunk,
    });
    newProductsCount += chunk.length;
    inactiveProductsCount += chunk.filter(p => !p.isActive).length;
    console.log(`Imported ${newProductsCount}/${productsToCreate.length} products...`);
  }

  console.log("Import Complete!");
  console.log(`Total Imported: ${newProductsCount}`);
  console.log(`Total Inactive (Price = 0): ${inactiveProductsCount}`);
  console.log(`Total Categories: ${categoryIdMap.size}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
