import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testOrder() {
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

    console.log("\n[2] Attempting to create an order with FAKE price (0.01)...");
    
    const fakePrice = 0.01;
    const fakeTotal = 0.02; // quantity 2

    const payload = {
        name: "Test Hacker",
        phone: "00099988877",
        city: "Test City",
        address: "Test Address",
        notes: "Trying to hack the price!",
        totalAmount: fakeTotal,
        items: [
            { productId: product.id, quantity: 2, price: fakePrice }
        ]
    };

    const res = await fetch("http://localhost:3001/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (!data.success) {
        console.error("❌ Order failed:", data);
        return;
    }

    const orderId = data.orderId;
    console.log(`✅ Order created successfully. Order ID: ${orderId}`);

    console.log("\n[3] Verifying prices stored in the database...");
    
    const savedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });

    console.log(`Stored Order Total: ${savedOrder.total} (Expected: ${product.price * 2})`);
    console.log(`Stored Item Unit Price: ${savedOrder.items[0].unitPriceAtOrder} (Expected: ${product.price})`);

    if (savedOrder.total === product.price * 2 && savedOrder.items[0].unitPriceAtOrder === product.price) {
        console.log("\n🛡️ TEST PASSED: The server successfully ignored the fake client price and enforced the real database price!");
    } else if (savedOrder.total === fakeTotal || savedOrder.items[0].unitPriceAtOrder === fakePrice) {
        console.log("\n🔴 TEST FAILED: The vulnerability still exists. Fake price was saved.");
    } else {
        console.log("\n❓ TEST UNKNOWN: The saved price doesn't match the real price or the fake price.");
    }

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testOrder();

