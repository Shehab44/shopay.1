"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import ProductImageUpload from "./ProductImageUpload";
import { getMoreProducts } from "./actions";

export default function ProductListClient({ 
  initialProducts, 
  q, 
  noImage 
}: { 
  initialProducts: any[], 
  q: string, 
  noImage: boolean 
}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length === 30);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, page]); // Re-bind observer when state changes

  const loadMore = async () => {
    const nextPage = page + 1;
    const newProducts = await getMoreProducts(q, noImage, (nextPage - 1) * 30, 30);
    
    if (newProducts.length === 0) {
      setHasMore(false);
    } else {
      setProducts(prev => [...prev, ...newProducts]);
      setPage(nextPage);
      if (newProducts.length < 30) setHasMore(false);
    }
  };

  return (
    <>
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
                  <span className={`px-2 py-1 rounded text-xs font-bold ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {product.isActive ? "نشط" : "معطل"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-shopay-black/50 hover:text-shopay-purple inline-block">
                    <Edit className="w-5 h-5" />
                  </Link>
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

        {hasMore && (
          <div ref={loaderRef} className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-shopay-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
}
