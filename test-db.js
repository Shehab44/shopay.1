
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ take: 5 });
  console.log("Sample products:", products.map(p => ({ id: p.id, matCode: p.matCode, stock: p.stockQuantity })));
}
main().catch(console.error).finally(() => prisma.$disconnect());

