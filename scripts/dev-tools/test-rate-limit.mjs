async function testRateLimits() {
  console.log('[1] Testing OTP Rate Limit (Limit = 3)');
  const phone = '0000000000';
  
  for (let i = 1; i <= 4; i++) {
    const res = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request_otp', phone })
    });
    const data = await res.json();
    console.log(`Request ${i}: Status=${res.status}, Response=`, data);
  }

  console.log('\n[2] Testing Login Rate Limit (Limit = 5)');
  for (let i = 1; i <= 6; i++) {
    const res = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ phone: '9999999999', password: 'wrongpassword', json: 'true' })
    });
    const data = await res.json();
    console.log(`Login attempt ${i}: Error URL =`, data.url);
  }
}
testRateLimits();

