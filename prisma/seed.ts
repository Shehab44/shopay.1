import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("❌ CRITICAL ERROR: SEED_ADMIN_PASSWORD environment variable is missing.");
    console.error("Please set it in your .env file to run the seed script safely.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(adminPassword, 10);
  
  const adminPhone = process.env.SEED_ADMIN_PHONE || '0000000000';

  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      passwordHash: hash,
      role: 'admin'
    },
    create: {
      fullName: 'المدير العام',
      phone: adminPhone,
      passwordHash: hash,
      role: 'admin'
    }
  });

  console.log(`✅ Admin user seeded successfully with phone: ${adminPhone}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
