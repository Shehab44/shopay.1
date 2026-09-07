
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function run() {
  const res = await prisma.product.updateMany({
    where: { isActive: true },
    data: { stockQuantity: 9999 }
  });
  console.log(`Updated ${res.count} products to have stock 9999`);
}
run().finally(() => prisma.$disconnect());

