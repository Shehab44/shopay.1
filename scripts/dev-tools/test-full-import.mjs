import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

async function fullImportTest() {
  try {
    console.log('[1] Fetching a real product from DB for UPDATE test...');
    const realProduct = await prisma.product.findFirst({
      where: { isActive: true }
    });
    
    if (!realProduct) {
      console.error('No active products found to test update.');
      return;
    }
    console.log(`Original Product: matCode=${realProduct.matCode}, Name="${realProduct.nameAr}", Price=${realProduct.price}`);
    const originalPrice = realProduct.price;
    const testPrice = originalPrice + 10; // Change the price

    console.log('\n[2] Creating Excel file with existing product (different price) and a dummy product...');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Sheet');
    
    worksheet.columns = [
      { header: 'الرمز', key: 'matCode' },
      { header: 'الاسم', key: 'name' },
      { header: 'السعر الإفرادي', key: 'price' }
    ];
    
    // Existing product
    worksheet.addRow({ matCode: realProduct.matCode, name: realProduct.nameAr, price: testPrice });
    // New dummy product
    const dummyMatCode = '9999999';
    worksheet.addRow({ matCode: dummyMatCode, name: 'Dummy Product For Update Test', price: 777 });
    
    const filePath = path.join(__dirname, 'test-update.xlsx');
    await workbook.xlsx.writeFile(filePath);

    console.log('\n[3] Authenticating as Admin...');
    const csrfRes = await fetch('http://localhost:3001/api/auth/csrf');
    const csrfData = await csrfRes.json();
    const rawCookies = csrfRes.headers.get('set-cookie');
    const initCookies = rawCookies ? rawCookies.split(',').map(c => c.split(';')[0]).join('; ') : '';

    const loginRes = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': initCookies },
      body: new URLSearchParams({ phone: '0000000000', password: 'ShopAdmin@2026!', csrfToken: csrfData.csrfToken, json: 'true' }),
      redirect: 'manual'
    });

    const sessionCookiesRaw = loginRes.headers.get('set-cookie');
    const sessionCookies = sessionCookiesRaw.split(',').map(c => c.split(';')[0]).join('; ');

    console.log('\n[4] Hitting /preview endpoint...');
    const blob = new Blob([fs.readFileSync(filePath)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const formData = new FormData();
    formData.append('file', blob, 'test-update.xlsx');

    const prevRes = await fetch('http://localhost:3001/api/v1/admin/import/preview', {
      method: 'POST',
      headers: { 'Cookie': sessionCookies },
      body: formData
    });
    const prevData = await prevRes.json();
    console.log('Preview Response:', prevData);
    if (prevData.updatedPrices === 1 && prevData.newProducts === 1) {
        console.log('✅ Preview correctly identified 1 update and 1 new product!');
    } else {
        console.log('❌ Preview failed to identify the correct counts.');
    }

    console.log('\n[5] Hitting /commit endpoint...');
    const comRes = await fetch('http://localhost:3001/api/v1/admin/import/commit', {
      method: 'POST',
      headers: { 'Cookie': sessionCookies },
      body: formData
    });
    const comData = await comRes.json();
    console.log('Commit Response:', comData);

    console.log('\n[6] Verifying DB Update...');
    const updatedProduct = await prisma.product.findUnique({ where: { matCode: realProduct.matCode } });
    console.log(`Updated Product DB Price: ${updatedProduct.price} (Expected: ${testPrice})`);
    if (updatedProduct.price === testPrice) {
        console.log('✅ DB correctly updated the price of the existing product!');
    } else {
        console.log('❌ DB failed to update the price.');
    }

    console.log('\n[7] Cleaning up all test data (Restoring price, deleting dummies)...');
    // Restore price
    await prisma.product.update({
        where: { matCode: realProduct.matCode },
        data: { price: originalPrice }
    });
    console.log(`✅ Restored ${realProduct.matCode} price to ${originalPrice}`);

    // Delete dummy product from this test
    await prisma.product.deleteMany({ where: { matCode: dummyMatCode } });
    await prisma.category.deleteMany({ where: { codePrefix: '999' } });
    
    // Delete dummy products from previous test (1010001, 1010002)
    const delResult = await prisma.product.deleteMany({
        where: { matCode: { in: ['1010001', '1010002'] } }
    });
    console.log(`✅ Deleted ${delResult.count} dummy products from previous tests.`);

    // Remove file
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fullImportTest();

