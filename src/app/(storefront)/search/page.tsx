/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import { Search as SearchIcon } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : '';

  if (!q) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
        <SearchIcon className="w-16 h-16 text-shopay-black/20 mb-4" />
        <h1 className="text-2xl font-bold text-shopay-black mb-2">البحث عن المنتجات</h1>
        <p className="text-shopay-black/50">الرجاء إدخال اسم المنتج أو الكود في مربع البحث</p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true, stockQuantity: { gt: 0 },
      OR: [
        { nameAr: { contains: q } },
        { matCode: { contains: q } }
      ]
    },
    include: { category: true },
    take: 48, // Limit search results to prevent huge queries
    orderBy: { id: 'desc' }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 border-b border-shopay-gray-light pb-4">
        <h1 className="text-2xl font-bold text-shopay-black">
          نتائج البحث عن: <span className="text-shopay-purple">&quot;{q}&quot;</span>
        </h1>
        <p className="text-shopay-black/50 mt-2">
          تم العثور على {products.length} {products.length === 1 ? 'منتج' : 'منتجات'}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-shopay-black/50 flex flex-col items-center">
          <SearchIcon className="w-12 h-12 text-shopay-black/20 mb-4" />
          لا توجد نتائج مطابقة لبحثك. جرب كلمات أخرى أو تأكد من صحة الرمز.
        </div>
      )}
    </div>
  );
}
