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

async function test() {
  try {
    console.log("=== Testing Axis 1 ===");
    let res = await fetch('http://localhost:3000/');
    console.log("Home (3000):", res.status);
    
    // Test admin unauthenticated
    res = await fetch('http://localhost:3000/admin');
    console.log("Admin Redirect:", res.status, res.headers.location);
    
  } catch(e) {
    console.error("Fetch error:", e.message);
  }
}
test();

