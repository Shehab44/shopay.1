import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const p = await prisma.product.findFirst();
  console.log("First Product ID:", p?.id);
}
check();

