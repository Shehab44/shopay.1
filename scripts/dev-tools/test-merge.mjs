import http from 'http';
import { PrismaClient } from '@prisma/client';

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testGuestMerge() {
  console.log("1. Request OTP for the guest account");
  const otpReqBody = JSON.stringify({
    action: "request_otp",
    phone: "96170000009"
  });
  
  let res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(otpReqBody) },
    body: otpReqBody
  });
  console.log("OTP Request status:", res.status, res.body);
  
  // Wait a sec for the OTP to be printed (simulated)
  
  // Note: Since I don't know the exact OTP generated (it's randomly generated and logged in dev server console), 
  // I can't easily submit it via HTTP here unless I read the DB. 
  // Let me read the OTP from the DB!

  const prisma = new PrismaClient();
  const otpRecord = await prisma.otpCode.findFirst({ where: { phone: "96170000009" }, orderBy: { createdAt: 'desc' } });
  console.log("OTP from DB:", otpRecord?.code);
  
  console.log("2. Verify OTP and merge");
  const mergeReqBody = JSON.stringify({
    action: "verify_otp",
    phone: "96170000009",
    fullName: "Real Registered User",
    password: "realpassword123",
    otpCode: otpRecord?.code || "123456"
  });
  
  res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(mergeReqBody) },
    body: mergeReqBody
  });
  
  console.log("Merge status:", res.status, res.body);
  
  // Check if it's no longer GUEST_NO_LOGIN
  const updatedUser = await prisma.user.findUnique({ where: { phone: "96170000009" } });
  console.log("Updated passwordHash:", updatedUser?.passwordHash.substring(0, 15) + "...");
  console.log("Updated fullName:", updatedUser?.fullName);
  
  await prisma.$disconnect();
}

testGuestMerge();

