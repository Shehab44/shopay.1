
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function run() {
  const allActive = await prisma.product.count({ where: { isActive: true } });
  const activeWithStock = await prisma.product.count({ where: { isActive: true, stockQuantity: { gt: 0 } } });
  const activeZeroStock = await prisma.product.count({ where: { isActive: true, stockQuantity: 0 } });
  
  console.log(`Total Active: ${allActive}`);
  console.log(`Active with Stock (>0): ${activeWithStock}`);
  console.log(`Active Zero Stock: ${activeZeroStock}`);
}
run().finally(() => prisma.$disconnect());

