import prisma from "@/lib/db";
import HomeClient from "./HomeClient";

export default async function Home() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { id: 'desc' }
  });

  const featuredProducts = await prisma.product.findMany({
    take: 12,
    include: { category: true },
    orderBy: { id: 'asc' }, 
    where: { isActive: true, stockQuantity: { gt: 0 } }
  });

  const newProducts = await prisma.product.findMany({
    take: 12,
    include: { category: true },
    orderBy: { id: 'desc' }, 
    where: { isActive: true, stockQuantity: { gt: 0 } }
  });

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    take: 12
  });

  return (
    <HomeClient 
      banners={banners}
      featuredProducts={featuredProducts} 
      newProducts={newProducts} 
      categories={categories} 
    />
  );
}
