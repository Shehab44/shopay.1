import prisma from "@/lib/db";
import HomeClient from "./HomeClient";

export default async function Home() {
  // Fetch products
  const featuredProducts = await prisma.product.findMany({
    take: 8,
    include: { category: true },
    orderBy: { id: 'asc' }, 
    where: { isActive: true, stockQuantity: { gt: 0 } }
  });

  const newProducts = await prisma.product.findMany({
    take: 8,
    include: { category: true },
    orderBy: { id: 'desc' }, 
    where: { isActive: true, stockQuantity: { gt: 0 } }
  });

  // Fetch all categories for the category grid
  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
    take: 12
  });

  return (
    <HomeClient 
      featuredProducts={featuredProducts} 
      newProducts={newProducts} 
      categories={categories} 
    />
  );
}
