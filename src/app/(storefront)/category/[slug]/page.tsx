import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const category = await prisma.category.findUnique({
    where: { codePrefix: slug }
  });

  if (!category) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
    include: { units: true, category: true },
    take: 20 // Just for initial load, usually handled with pagination
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-shopay-black/50 mb-6 flex items-center gap-2">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-shopay-black font-semibold">{category.nameAr}</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters (Placeholder) */}
        <div className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="bg-shopay-gray-light p-6 rounded-2xl sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-shopay-black">تصفية النتائج</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-sm text-shopay-black/70">السعر</h4>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="من" className="w-full p-2 text-sm rounded bg-shopay-white border-none focus:ring-2 focus:ring-shopay-purple/50" />
                <span>-</span>
                <input type="number" placeholder="إلى" className="w-full p-2 text-sm rounded bg-shopay-white border-none focus:ring-2 focus:ring-shopay-purple/50" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-sm text-shopay-black/70">الفرز</h4>
              <select className="w-full p-2 text-sm rounded bg-shopay-white border-none focus:ring-2 focus:ring-shopay-purple/50">
                <option>الأحدث</option>
                <option>الأقل سعراً</option>
                <option>الأعلى سعراً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-shopay-black">{category.nameAr}</h1>
            <span className="text-shopay-black/50 text-sm">{products.length} منتجات</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-20 text-shopay-black/50">
              لا توجد منتجات في هذا القسم حالياً.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
