import prisma from "@/lib/db";
import { Search } from "lucide-react";
import ProductListClient from "./ProductListClient";
import NoImageFilter from "./NoImageFilter";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; noImage?: string; categoryId?: string }>;
}) {
  const query = await searchParams;
  const q = query.q || "";
  const noImage = query.noImage === "true";
  const categoryId = query.categoryId ? parseInt(query.categoryId) : undefined;
  const page = parseInt(query.page || "1");
  const limit = 30;

  // جلب كافة الأقسام الرئيسية الـ 14 لشريط التصفية والقوائم المنسدلة
  const categories = await prisma.category.findMany({
    orderBy: { codePrefix: "asc" },
  });
  
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { nameAr: { contains: q } },
      { matCode: { contains: q } },
    ];
  }
  if (noImage) {
    where.mainImageUrl = null;
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }

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
        <h2 className="text-2xl font-bold text-shopay-black">إدارة المنتجات والأقسام</h2>
      </div>

      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden">
        {/* شريط التصفية العلوي (Filters Bar) */}
        <div className="p-4 border-b border-shopay-gray-light flex flex-wrap items-center justify-between gap-4">
          <form className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl" method="GET" action="/admin/products">
            <div className="relative flex-1 min-w-[240px]">
              <input 
                type="text" 
                name="q"
                placeholder="ابحث برمز المادة أو اسم المنتج..." 
                defaultValue={q}
                className="w-full bg-shopay-gray-light text-shopay-black px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 text-sm"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-shopay-black/50 hover:text-shopay-purple">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* قائمة منسدلة لتصفية المنتجات حسب القسم */}
            <select
              name="categoryId"
              defaultValue={query.categoryId || ""}
              className="bg-shopay-gray-light text-shopay-black px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 border-0"
            >
              <option value="">جميع الأقسام (الكل)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.codePrefix}] {c.nameAr}
                </option>
              ))}
            </select>

            {noImage && <input type="hidden" name="noImage" value="true" />}

            <button
              type="submit"
              className="bg-shopay-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-shopay-purple/90 transition cursor-pointer"
            >
              تصفية
            </button>
          </form>

          <div className="flex items-center gap-2">
            <NoImageFilter q={q} noImage={noImage} />
          </div>
        </div>
        
        <ProductListClient 
          initialProducts={products} 
          categories={categories}
          q={q} 
          noImage={noImage}
          selectedCategoryId={categoryId || null}
        />
        
        <div className="p-4 border-t border-shopay-gray-light flex items-center justify-between text-sm text-shopay-black/70">
          <div>
            إجمالي المنتجات المطابقة: <span className="font-bold text-shopay-purple">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
