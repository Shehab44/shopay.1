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

async function testGuest() {
  const orderBody = JSON.stringify({
    name: "New Guest",
    phone: "96170000009",
    city: "Beirut",
    address: "Street 1",
    items: [ { productId: 6388, quantity: 1, price: 100 } ] // Assuming product 6388 exists
  });
  
  let res = await fetch('http://localhost:3001/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(orderBody) },
    body: orderBody
  });
  
  console.log("Guest order status:", res.status, res.body);
}

testGuest();

