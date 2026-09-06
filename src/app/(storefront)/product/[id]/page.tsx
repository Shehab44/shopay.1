/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProductClient from "@/components/product/ProductClient";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { matCode: id },
    include: {
      category: true,
    }
  });

  if (!product || !product.isActive || product.stockQuantity <= 0) {
    notFound();
  }

  return <ProductClient product={product as any} />;
}
