const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function m() { 
  const c = await p.category.findMany(); 
  console.log(c); 
} 
m().finally(() => p.$disconnect());
