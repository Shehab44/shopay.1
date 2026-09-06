async function testRateLimits() {
  console.log('\n[2] Testing Login Rate Limit (Limit = 5)');
  for (let i = 1; i <= 6; i++) {
    const res = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ phone: '1111111111', password: 'wrongpassword', json: 'true' }) // Different phone to avoid hitting previous limit
    });
    const data = await res.json();
    const errorParam = new URL(data.url).searchParams.get('error');
    console.log(`Login attempt ${i}: Error = ${errorParam}`);
  }
}
testRateLimits();

