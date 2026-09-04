"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Edit, Check, AlertCircle } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import ProductImageUpload from "./ProductImageUpload";
import { getMoreProducts } from "./actions";

interface Category {
  id: number;
  codePrefix: string;
  nameAr: string;
}

function InlineCategoryEditor({
  product,
  categories,
  onUpdated,
}: {
  product: any;
  categories: Category[];
  onUpdated: (updatedProduct: any) => void;
}) {
  const [selectedCatId, setSelectedCatId] = useState<string>(
    product.categoryId ? product.categoryId.toString() : ""
  );
  const [subCategory, setSubCategory] = useState<string>(
    product.subCategoryLabel || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const currentCatId = product.categoryId ? product.categoryId.toString() : "";
  const currentSubCat = product.subCategoryLabel || "";
  const hasChanges = selectedCatId !== currentCatId || subCategory !== currentSubCat;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch(`/api/v1/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCatId ? parseInt(selectedCatId) : null,
          subCategoryLabel: subCategory.trim() ? subCategory.trim() : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "فشل التحديث");
      }

      const data = await res.json();
      onUpdated(data.product);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e: any) {
      console.error("Save product category error:", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[200px] max-w-[240px]">
      <select
        value={selectedCatId}
        onChange={(e) => setSelectedCatId(e.target.value)}
        className="text-xs bg-shopay-gray-light border border-shopay-gray-light text-shopay-black rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-shopay-purple"
      >
        <option value="">-- بدون قسم --</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            [{c.codePrefix}] {c.nameAr}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          placeholder="التفرع (اختياري)..."
          className="text-xs bg-shopay-gray-light border border-shopay-gray-light text-shopay-black rounded px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-shopay-purple"
        />
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer flex items-center justify-center min-w-[48px] ${
            saveStatus === "saved"
              ? "bg-green-600 text-white"
              : saveStatus === "error"
              ? "bg-red-600 text-white"
              : hasChanges
              ? "bg-shopay-purple text-white hover:bg-shopay-purple/90"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="حفظ القسم والتفرع"
        >
          {isSaving ? "..." : saveStatus === "saved" ? "تم ✓" : saveStatus === "error" ? "خطأ" : "حفظ"}
        </button>
      </div>
    </div>
  );
}

export default function ProductListClient({ 
  initialProducts, 
  categories = [],
  q, 
  noImage,
  selectedCategoryId
}: { 
  initialProducts: any[];
  categories?: Category[];
  q: string;
  noImage: boolean;
  selectedCategoryId?: number | null;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length === 30);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Reset state when search parameters change
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialProducts.length === 30);
  }, [initialProducts, q, noImage, selectedCategoryId]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, page, isLoading]);

  const loadMore = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newProducts = await getMoreProducts(
        q, 
        noImage, 
        (nextPage - 1) * 30, 
        30,
        selectedCategoryId
      );
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => {
          const uniqueNewProducts = newProducts.filter(np => !prev.some(p => p.id === np.id));
          return [...prev, ...uniqueNewProducts];
        });
        setPage(nextPage);
        if (newProducts.length < 30) setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductUpdated = (updatedProduct: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-shopay-gray-light/50 text-shopay-black/70 text-sm">
            <tr>
              <th className="px-6 py-3 font-semibold">المنتج</th>
              <th className="px-6 py-3 font-semibold">رمز المادة</th>
              <th className="px-6 py-3 font-semibold">القسم والتفرع (تعديل مباشر)</th>
              <th className="px-6 py-3 font-semibold">السعر</th>
              <th className="px-6 py-3 font-semibold">الصورة</th>
              <th className="px-6 py-3 font-semibold">الحالة</th>
              <th className="px-6 py-3 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-shopay-gray-light">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-shopay-gray-light/30">
                <td className="px-6 py-4 font-semibold text-shopay-black max-w-[280px]">
                  {product.nameAr}
                </td>
                <td className="px-6 py-4 text-shopay-black/70 font-mono text-sm">
                  {product.matCode}
                </td>
                <td className="px-6 py-4">
                  <InlineCategoryEditor 
                    product={product}
                    categories={categories}
                    onUpdated={handleProductUpdated}
                  />
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
