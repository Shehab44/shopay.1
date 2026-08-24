import { CURRENCY_SYMBOL } from "@/lib/constants";
import prisma from "@/lib/db";
import Link from "next/link";
import { Search, Edit } from "lucide-react";
import ProductImageUpload from "./ProductImageUpload";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const query = await searchParams;
  const q = query.q || "";
  const page = parseInt(query.page || "1");
  const limit = 20;
  
  const where = q ? {
    OR: [
      { nameAr: { contains: q } },
      { matCode: { contains: q } },
    ]
  } : {};

  const total = await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-shopay-black">إدارة المنتجات</h2>
      </div>

      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden">
        <div className="p-4 border-b border-shopay-gray-light flex items-center gap-4">
          <form className="relative flex-1 max-w-md" method="GET" action="/admin/products">
            <input 
              type="text" 
              name="q"
              placeholder="ابحث برمز المادة أو اسم المنتج..." 
              defaultValue={q}
              className="w-full bg-shopay-gray-light text-shopay-black px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopay-purple/50"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-shopay-black/50 hover:text-shopay-purple">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-shopay-gray-light/50 text-shopay-black/70 text-sm">
              <tr>
                <th className="px-6 py-3 font-semibold">المنتج</th>
                <th className="px-6 py-3 font-semibold">رمز المادة</th>
                <th className="px-6 py-3 font-semibold">القسم</th>
                <th className="px-6 py-3 font-semibold">الوحدات والأسعار</th>
                <th className="px-6 py-3 font-semibold">الصورة</th>
                <th className="px-6 py-3 font-semibold">الحالة</th>
                <th className="px-6 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shopay-gray-light">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-shopay-gray-light/30">
                  <td className="px-6 py-4 font-semibold text-shopay-black">
                    {product.nameAr}
                  </td>
                  <td className="px-6 py-4 text-shopay-black/70 font-mono text-sm">
                    {product.matCode}
                  </td>
                  <td className="px-6 py-4 text-shopay-black/70">
                    {product.category?.nameAr}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <div>
                        <span className="font-semibold text-shopay-purple">{CURRENCY_SYMBOL}{product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ProductImageUpload 
                      productId={product.id}
                      matCode={product.matCode}
                      currentImageUrl={product.mainImageUrl}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-shopay-black/50 hover:text-shopay-purple">
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="text-center py-12 text-shopay-black/50">
              لم يتم العثور على منتجات تطابق بحثك.
            </div>
          )}
        </div>
        
        {/* Simple Pagination */}
        <div className="p-4 border-t border-shopay-gray-light flex items-center justify-between text-sm text-shopay-black/70">
          <div>
            إجمالي المنتجات: <span className="font-bold">{total}</span>
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/products?page=${page - 1}${q ? '&q='+q : ''}`} aria-label="الصفحة السابقة" className="px-3 py-1 border rounded hover:bg-shopay-gray-light">
                السابق
              </Link>
            )}
            {page * limit < total && (
              <Link href={`/admin/products?page=${page + 1}${q ? '&q='+q : ''}`} aria-label="الصفحة التالية" className="px-3 py-1 border rounded hover:bg-shopay-gray-light">
                التالي
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
