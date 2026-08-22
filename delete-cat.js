const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function m() { 
  await p.category.deleteMany({ where: { codePrefix: { startsWith: '0' } } }); 
  console.log('Old categories deleted.'); 
} 
m().finally(() => p.$disconnect());
