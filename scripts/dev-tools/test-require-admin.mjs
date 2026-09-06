async function testRequireAdmin() {
  try {
    console.log("[1] Sending PATCH to /api/v1/admin/orders/1 WITHOUT cookies (Bypassed Middleware)");
    const res = await fetch("http://localhost:3001/api/v1/admin/orders/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" })
    });
    
    console.log("Status Code:", res.status);
    const body = await res.text();
    console.log("Response Body:", body);
    
    if (res.status === 401 && body.includes("غير مصرح - يتطلب صلاحيات إدارة")) {
       console.log("✅ TEST PASSED: requireAdmin() independently intercepted and blocked the request!");
    } else {
       console.log("❌ TEST FAILED: Unexpected response.");
    }
  } catch(e) {
    console.error(e);
  }
}
testRequireAdmin();

