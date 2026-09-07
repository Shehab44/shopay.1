
async function run() {
  const payload = {
    name: "<script>alert(1)</script>",
    phone: "0999999999",
    city: "Test City",
    address: "<img src=x onerror=alert(1)>",
    notes: "No notes",
    items: [{ productId: 6388, quantity: 1 }] // we know 6388 has 9999 stock now
  };
  const res = await fetch("http://localhost:3000/api/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log("XSS Order Creation Response:", res.status, data);

  if (data.success && data.orderId) {
    const fetchOrder = await fetch(`http://localhost:3000/api/v1/admin/orders/${data.orderId}`);
    const orderText = await fetchOrder.text();
    // In React/Next.js SSR, raw HTML is escaped as &lt;script&gt;
    const isEscaped = orderText.includes("&lt;script&gt;alert(1)&lt;/script&gt;") || !orderText.includes("<script>alert(1)</script>");
    console.log("Is XSS Escaped properly in SSR?:", isEscaped ? "YES" : "NO");
  }
}
run();

