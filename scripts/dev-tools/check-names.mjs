// أداة تطوير: يعرض هذا السكريبت عينة من المنتجات للتحقق من ترميز الأسماء باللغة العربية.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() { 
  const prods = await p.product.findMany({ take: 5, select: { matCode: true, nameAr: true } }); 
  console.log(prods); 
} 
m().finally(() => p.$disconnect());

