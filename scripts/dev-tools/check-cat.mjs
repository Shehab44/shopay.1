// أداة تطوير: يعرض هذا السكريبت جميع الأقسام الموجودة في قاعدة البيانات للتأكد من صحتها.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() { 
  const c = await p.category.findMany(); 
  console.log(c); 
} 
m().finally(() => p.$disconnect());

