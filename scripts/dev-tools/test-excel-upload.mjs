import fs from 'fs';
import path from 'path';

async function testUpload() {
  const filePath = path.join(__dirname, 'test-upload.xlsx');
  
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  
  const blob = new Blob([fs.readFileSync(filePath)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const formData = new FormData();
  formData.append('file', blob, 'test-upload.xlsx');

  // First need to authenticate to get session cookies to bypass requireAdmin()
  const csrfRes = await fetch("http://localhost:3001/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const rawCookies = csrfRes.headers.get('set-cookie');
  const initCookies = rawCookies ? rawCookies.split(',').map(c => c.split(';')[0]).join('; ') : '';

  const loginRes = await fetch("http://localhost:3001/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": initCookies },
    body: new URLSearchParams({ phone: "0000000000", password: "ShopAdmin@2026!", csrfToken: csrfData.csrfToken, json: "true" }),
    redirect: "manual"
  });

  const sessionCookiesRaw = loginRes.headers.get('set-cookie');
  const sessionCookies = sessionCookiesRaw.split(',').map(c => c.split(';')[0]).join('; ');

  console.log('[1] Testing Preview...');
  const prevRes = await fetch('http://localhost:3001/api/v1/admin/import/preview', {
    method: 'POST',
    headers: { 'Cookie': sessionCookies },
    body: formData
  });
  console.log('Preview Status:', prevRes.status);
  const prevData = await prevRes.json();
  console.log('Preview Data:', prevData);

  console.log('\n[2] Testing Commit...');
  const comRes = await fetch('http://localhost:3001/api/v1/admin/import/commit', {
    method: 'POST',
    headers: { 'Cookie': sessionCookies },
    body: formData
  });
  console.log('Commit Status:', comRes.status);
  const comData = await comRes.json();
  console.log('Commit Data:', comData);
}

testUpload();

