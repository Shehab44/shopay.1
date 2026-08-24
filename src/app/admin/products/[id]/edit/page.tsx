import prisma from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import EditProductClient from './EditProductClient';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);
  
  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true }
  });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-shopay-black mb-6">تعديل المنتج: {product.nameAr}</h2>
      <div className="bg-shopay-white p-6 rounded-2xl border border-shopay-gray-light shadow-sm">
        <EditProductClient product={product} />
      </div>
    </div>
  );
}
