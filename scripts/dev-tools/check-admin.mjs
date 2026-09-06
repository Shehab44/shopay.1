import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function getAdmin() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  console.log("Admin Phone:", admin?.phone);
}
getAdmin();

