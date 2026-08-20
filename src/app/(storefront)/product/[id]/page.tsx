import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProductClient from "@/components/product/ProductClient";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { matCode: id },
    include: {
      units: true,
      category: true,
    }
  });

  if (!product) {
    notFound();
  }

  return <ProductClient product={product as any} />;
}
