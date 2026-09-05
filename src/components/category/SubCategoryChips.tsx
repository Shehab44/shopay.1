"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface SubCategoryChipsProps {
  subCategories: string[];
  activeSubCategory?: string | null;
}

export default function SubCategoryChips({
  subCategories,
  activeSubCategory,
}: SubCategoryChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // إذا كانت مصفوفة التفرعات فارغة، لا نعرض أي شيء
  if (!subCategories || subCategories.length === 0) {
    return null;
  }

  const handleSelect = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // إعادة تعيين رقم الصفحة إلى البداية عند تبديل التفرع
    params.delete("page");

    if (!categoryName || categoryName === "all") {
      params.delete("subCategory");
    } else {
      params.set("subCategory", categoryName);
    }

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const isAllActive = !activeSubCategory || activeSubCategory === "all";

  return (
    <div className="w-full overflow-hidden">
      <div 
        className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* شريحة "الكل" لإلغاء التصفية */}
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
            isAllActive
              ? "bg-shopay-purple text-white shadow-sm font-bold"
              : "bg-shopay-white text-shopay-black/80 hover:bg-shopay-gray-light hover:text-shopay-purple border border-shopay-gray-light"
          }`}
        >
          الكل
        </button>

        {/* شرائح التفرعات المتاحة */}
        {subCategories.map((subCat) => {
          const isActive = activeSubCategory === subCat;
          return (
            <button
              key={subCat}
              type="button"
              onClick={() => handleSelect(subCat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-shopay-purple text-white shadow-sm font-bold"
                  : "bg-shopay-white text-shopay-black/80 hover:bg-shopay-gray-light hover:text-shopay-purple border border-shopay-gray-light"
              }`}
            >
              {subCat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
