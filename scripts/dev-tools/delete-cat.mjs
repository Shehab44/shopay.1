// أداة تطوير: يحذف هذا السكريبت بعض الأقسام القديمة مباشرة من قاعدة البيانات.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() { 
  await p.category.deleteMany({ where: { codePrefix: { startsWith: '0' } } }); 
  console.log('Old categories deleted.'); 
} 
m().finally(() => p.$disconnect());

