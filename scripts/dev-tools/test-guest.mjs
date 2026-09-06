import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testGuestMerge() {
  try {
    const phone = '96170000001';
    
    // 1. Create a guest order directly
    const guestUser = await prisma.user.create({
      data: {
        phone: phone,
        fullName: 'Guest User',
        role: 'customer',
        passwordHash: 'GUEST_NO_LOGIN'
      }
    });
    
    console.log("Guest User created:", guestUser.id);
    
    const guestOrder = await prisma.order.create({
      data: {
        userId: guestUser.id,
        total: 100,
        status: 'pending',
        address: {
          create: {
            city: 'Beirut',
            fullAddress: 'Test Addr'
          }
        },
        items: {
          create: [
            {
              productId: 1, // Assuming product 1 exists
              quantity: 1,
              priceAtOrder: 100
            }
          ]
        }
      }
    });
    
    console.log("Guest Order created:", guestOrder.id);
    
  } catch(e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
testGuestMerge();

