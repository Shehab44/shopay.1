import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testQuantity() {
  try {
    console.log("[1] Finding a real product from the database...");
    const product = await prisma.product.findFirst({
        where: { isActive: true }
    });
    
    if (!product) {
        console.error("No active products found to test with.");
        return;
    }
    
    console.log(`Target Product: ID=${product.id}, Name="${product.nameAr}", REAL PRICE=${product.price}`);

    const runTest = async (testName, testQuantity) => {
        console.log(`\n[2] Attempting: ${testName} with quantity = ${testQuantity}`);
        
        const payload = {
            name: "Test Quantity Hacker",
            phone: "00088877766",
            city: "Test City",
            address: "Test Address",
            notes: "Trying to hack the quantity!",
            items: [
                { productId: product.id, quantity: testQuantity, price: product.price }
            ]
        };

        const res = await fetch("http://localhost:3001/api/v1/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log(`Status Code: ${res.status}`);
        const data = await res.json();
        
        if (!res.ok) {
            console.log(`✅ SERVER REJECTED: ${data.error}`);
        } else {
            console.log(`🔴 VULNERABILITY EXISTS: Order created with ID: ${data.orderId}`);
        }
    };

    await runTest("Negative Quantity", -5);
    await runTest("Zero Quantity", 0);
    await runTest("Decimal Quantity", 1.5);
    await runTest("String Quantity", "2");

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testQuantity();

