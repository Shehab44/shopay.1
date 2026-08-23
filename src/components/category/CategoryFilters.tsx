"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

export default function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentMin = searchParams.get("min") || "";
  const currentMax = searchParams.get("max") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const [minPrice, setMinPrice] = useState(currentMin);
  const [maxPrice, setMaxPrice] = useState(currentMax);

  const applyFilters = (newSort?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Always reset to page 1 when filtering
    params.set("page", "1");

    if (minPrice) params.set("min", minPrice);
    else params.delete("min");

    if (maxPrice) params.set("max", maxPrice);
    else params.delete("max");

    if (newSort) params.set("sort", newSort);
    else params.set("sort", currentSort);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-shopay-gray-light p-6 rounded-2xl sticky top-24 border border-shopay-gray-light/80">
      <h3 className="font-bold text-lg mb-4 text-shopay-black">تصفية النتائج</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-sm text-shopay-black/70">السعر</h4>
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="number" 
            placeholder="من" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full p-2 text-sm rounded bg-shopay-white border border-shopay-gray-light focus:outline-none focus:ring-2 focus:ring-shopay-purple/50" 
          />
          <span className="text-shopay-black/50">-</span>
          <input 
            type="number" 
            placeholder="إلى" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 text-sm rounded bg-shopay-white border border-shopay-gray-light focus:outline-none focus:ring-2 focus:ring-shopay-purple/50" 
          />
        </div>
        <button 
          onClick={() => applyFilters()}
          className="w-full bg-shopay-purple text-white text-sm font-bold py-2 rounded hover:bg-shopay-black transition-colors"
        >
          تطبيق السعر
        </button>
      </div>
      
      <div>
        <h4 className="font-semibold mb-3 text-sm text-shopay-black/70">الفرز</h4>
        <select 
          value={currentSort}
          onChange={(e) => applyFilters(e.target.value)}
          className="w-full p-2 text-sm rounded bg-shopay-white border border-shopay-gray-light focus:outline-none focus:ring-2 focus:ring-shopay-purple/50"
        >
          <option value="newest">الأحدث</option>
          <option value="price_asc">الأقل سعراً</option>
          <option value="price_desc">الأعلى سعراً</option>
        </select>
      </div>
    </div>
  );
}
