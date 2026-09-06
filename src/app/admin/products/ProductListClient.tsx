/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import ProductImageUpload from "./ProductImageUpload";
import { getMoreProducts } from "./actions";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";

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
  onUpdated: (updatedproduct: any) => void;
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
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length === 30);
  const [prevInitialProducts, setPrevInitialProducts] = useState(initialProducts);
  const loaderRef = useRef<HTMLDivElement>(null);

  if (initialProducts !== prevInitialProducts) {
    setPrevInitialProducts(initialProducts);
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialProducts.length === 30);
  }

  const [isLoading, setIsLoading] = useState(false);

  // Status Modal States
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedProductForStatus, setSelectedProductForStatus] = useState<any>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleToggleStatusClick = (product: any) => {
    setSelectedProductForStatus(product);
    setIsStatusModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedProductForStatus) return;
    setIsTogglingStatus(true);
    try {
      const res = await fetch(`/api/v1/admin/products/${(selectedProductForStatus as any).id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !(selectedProductForStatus as any).isActive
        }),
      });

      if (!res.ok) throw new Error("فشل تغيير الحالة");
      const data = await res.json();
      
      handleProductUpdated(data.product);
      toast.success("تم تغيير حالة المنتج بنجاح");
      setIsStatusModalOpen(false);
    } catch {
      toast.error("حدث خطأ أثناء تغيير الحالة");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const loadMore = useCallback(async () => {
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
  }, [isLoading, page, q, noImage, selectedCategoryId]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    }, { threshold: 0.1 });

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, isLoading, loadMore]);

  const handleProductUpdated = (updatedproduct: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedproduct.id ? { ...p, ...updatedproduct } : p))
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
                  <span>{product.nameAr}</span>
                </td>
                <td className="px-6 py-4 text-shopay-black/70 font-mono text-sm">
                  <span>{product.matCode}</span>
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
                  <button 
                    onClick={() => handleToggleStatusClick(product)}
                    className={`px-2 py-1 rounded text-xs font-bold hover:opacity-80 transition-opacity ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {product.isActive ? "نشط" : "معطل"}
                  </button>
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

      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => !isTogglingStatus && setIsStatusModalOpen(false)}
        title="تأكيد تغيير الحالة"
      >
        <div className="text-shopay-black text-sm mb-6">
          هل أنت متأكد من تغيير حالة ظهور هذا المنتج للمستخدمين؟
        </div>
        <div className="flex gap-4">
          <button
            onClick={confirmToggleStatus}
            disabled={isTogglingStatus}
            className="bg-shopay-purple hover:bg-shopay-purple/90 text-white px-4 py-2 rounded-lg font-bold flex-1 flex items-center justify-center gap-2"
          >
            {isTogglingStatus ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "تأكيد"}
          </button>
          <button
            onClick={() => setIsStatusModalOpen(false)}
            disabled={isTogglingStatus}
            className="bg-shopay-gray-light text-shopay-black px-4 py-2 rounded-lg font-bold hover:bg-black/5 flex-1"
          >
            إلغاء
          </button>
        </div>
      </Modal>
    </>
  );
}
