import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

async function testUploadError() {
  const filePath = path.join(__dirname, 'test-bad-image.txt');
  fs.writeFileSync(filePath, 'Not an image, just some random text that will fail Cloudinary validation.');

  const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', blob, 'test-bad-image.txt');

  console.log('[1] Authenticating...');
  const csrfRes = await fetch('http://localhost:3002/api/auth/csrf');
  const csrfData = await csrfRes.json();
  const rawCookies = csrfRes.headers.get('set-cookie');
  const initCookies = rawCookies ? rawCookies.split(',').map(c => c.split(';')[0]).join('; ') : '';

  const loginRes = await fetch('http://localhost:3002/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': initCookies },
    body: new URLSearchParams({ phone: '0000000000', password: 'ShopAdmin@2026!', csrfToken: csrfData.csrfToken, json: 'true' }),
    redirect: 'manual'
  });
  const sessionCookies = loginRes.headers.get('set-cookie').split(',').map(c => c.split(';')[0]).join('; ');

  console.log('\n[2] Uploading bad image (expects Cloudinary Error)...');
  // Need a valid product ID. I'll use 6388 (or whatever is in the DB)
  // Let's first fetch a valid product

  const prisma = new PrismaClient();
  const product = await prisma.product.findFirst();
  
  if(!product) {
     console.log("No product found.");
     return;
  }

  const upRes = await fetch(`http://localhost:3002/api/v1/admin/products/${product.id}/image`, {
    method: 'POST',
    headers: { 'Cookie': sessionCookies },
    body: formData
  });

  const upData = await upRes.json();
  console.log('Status:', upRes.status);
  console.log('Error Data returned to client:', upData);

  fs.unlinkSync(filePath);
  await prisma.$disconnect();
}
testUploadError();

