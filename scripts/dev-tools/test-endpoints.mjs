import http from 'http';

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

async function testEndpoints() {
  // Test Register API
  const regBody = JSON.stringify({
    action: "register",
    fullName: "QA Tester",
    phone: "96180000003",
    password: "password123"
  });
  
  console.log("Testing Registration:");
    let res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(regBody) },
    body: regBody
  });
  console.log("Register response:", res.status, res.body);

  // Test admin dashboard unauth
  res = await fetch('http://localhost:3001/admin');
  console.log("Admin route protection:", res.status, res.headers.location);

  // Search API (It's a page but we can fetch it)
  res = await fetch('http://localhost:3001/search?q=103');
  console.log("Search response status:", res.status);
}

testEndpoints();

