// أداة تطوير: يستخرج هذا السكريبت جميع بادئات الأكواد (أول 3 خانات) المستخدمة في المنتجات للتحقق من الأقسام.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() { 
  const prods = await p.product.findMany({ select: { matCode: true, categoryId: true } }); 
  const prefixes = new Set(prods.map(x => x.matCode.substring(0, 3))); 
  console.log(Array.from(prefixes)); 
} 
m().finally(() => p.$disconnect());

