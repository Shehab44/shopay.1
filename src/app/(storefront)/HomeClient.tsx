"use client";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { ChevronLeft } from "lucide-react";

export default function HomeClient({ 
  banners,
  featuredProducts, 
  newProducts,
  categories
}: { 
  banners: any[],
  featuredProducts: any[], 
  newProducts: any[],
  categories: any[]
}) {
  
  // Custom color palette for categories to match Dabdoob style
  const gradients = [
    "from-teal-400 to-emerald-500",
    "from-pink-400 to-rose-500",
    "from-amber-400 to-orange-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-fuchsia-500",
    "from-cyan-400 to-blue-500",
  ];

  return (
    <div className="flex flex-col gap-10 md:gap-16 pb-16 pt-4 bg-gray-50/50 min-h-screen">
      
      {/* 1. Main Banners Section */}
      {banners && banners.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
            {banners.map((banner, idx) => (
              <Link 
                key={banner.id} 
                href={banner.linkUrl || "#"} 
                className="w-full md:min-w-0 md:flex-1 shrink-0 snap-center block relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={banner.imageUrl} 
                  alt={`Banner ${idx + 1}`} 
                  className="w-full h-48 md:h-[400px] object-cover"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2. Top Categories Quick Links (Similar to Dabdoob's 3 colorful buttons) */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <Link href="/category/all" className="bg-pink-500 rounded-xl md:rounded-2xl p-4 md:p-8 flex items-center justify-center text-white font-black text-xl md:text-4xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            للبنات
          </Link>
          <Link href="/category/all" className="bg-amber-400 rounded-xl md:rounded-2xl p-4 md:p-8 flex items-center justify-center text-white font-black text-xl md:text-4xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            للبيبي
          </Link>
          <Link href="/category/all" className="bg-shopay-purple rounded-xl md:rounded-2xl p-4 md:p-8 flex items-center justify-center text-white font-black text-xl md:text-4xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            للأولاد
          </Link>
        </div>
      </section>

      {/* 3. Horizontal Product Scroller (Featured) */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-shopay-black">الأكثر مبيعاً</h2>
          <Link href="/category/all" className="text-sm font-bold text-gray-500 hover:text-shopay-purple flex items-center">
            إظهار الكل <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="w-[160px] md:w-[240px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Horizontal Product Scroller (New Arrivals) */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-shopay-black flex items-center gap-2">
            <span className="text-amber-500 text-3xl mb-1">🎁</span> وصل حديثاً
          </h2>
          <Link href="/category/all" className="text-sm font-bold text-gray-500 hover:text-shopay-purple flex items-center">
            إظهار الكل <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
          {newProducts.map((product) => (
            <div key={product.id} className="w-[160px] md:w-[240px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Categories Grid (Dabdoob Style) */}
      <section className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, idx) => {
            const gradient = gradients[idx % gradients.length];
            return (
              <Link 
                key={cat.id} 
                href={`/category/${cat.id}`} 
                className="group relative block rounded-2xl md:rounded-3xl overflow-hidden aspect-[2/1] md:aspect-[2.5/1] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                {/* Background Image if exists */}
                {cat.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={cat.imageUrl} 
                    alt={cat.nameAr} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                )}
                
                {/* Colorful Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent mix-blend-multiply`} />
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-60`} />
                
                {/* Text */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <h3 className="text-white font-black text-lg md:text-2xl text-center shadow-black/50 drop-shadow-md">
                    {cat.nameAr}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
