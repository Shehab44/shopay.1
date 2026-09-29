/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/ui/Pagination";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
  const categoryFilter = typeof resolvedParams.category === 'string' ? parseInt(resolvedParams.category) : undefined;
  const minPrice = typeof resolvedParams.minPrice === 'string' ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = typeof resolvedParams.maxPrice === 'string' ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest';

  const limit = 24;
  const skip = (page - 1) * limit;

  const words = q.split(/\s+/).filter(word => word.length > 0);
  const searchConditions = words.map(word => ({
    OR: [
      { nameAr: { contains: word } },
      { matCode: { contains: word } },
      { description: { contains: word } }
    ]
  }));

  const where: any = {
    isActive: true,
    stockQuantity: { gt: 0 },
    AND: searchConditions
  };

  if (categoryFilter) {
    where.categoryId = categoryFilter;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  let orderBy: any = { id: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { price: 'desc' };
  }

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      take: limit,
      skip,
      orderBy
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { displayOrder: 'asc' } })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Helper to construct URLs for filters/pagination
  const buildUrl = (paramsToUpdate: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    
    const newCategory = paramsToUpdate.category !== undefined ? paramsToUpdate.category : categoryFilter;
    if (newCategory) params.set('category', newCategory.toString());
    
    const newSort = paramsToUpdate.sort !== undefined ? paramsToUpdate.sort : sort;
    if (newSort && newSort !== 'newest') params.set('sort', newSort.toString());
    
    const newPage = paramsToUpdate.page !== undefined ? paramsToUpdate.page : page;
    const newPageNum = Number(newPage);
    if (newPageNum && newPageNum > 1) params.set('page', newPageNum.toString());

    return `/search?${params.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 border-b border-shopay-gray-light pb-4">
        <h1 className="text-2xl font-bold text-shopay-black">
          نتائج البحث عن: <span className="text-shopay-purple">&quot;{q}&quot;</span>
        </h1>
        <p className="text-shopay-black/50 mt-2">
          تم العثور على {totalCount} {totalCount === 1 ? 'منتج' : totalCount === 2 ? 'منتجان' : totalCount <= 10 ? 'منتجات' : 'منتج'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-6">
          {/* Sorting */}
          <div className="bg-white p-4 rounded-xl border border-shopay-gray-light">
            <h3 className="font-bold text-shopay-black mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" /> ترتيب حسب
            </h3>
            <div className="flex flex-col gap-2">
              <Link href={buildUrl({ sort: 'newest', page: 1 })} className={`p-2 text-sm rounded ${sort === 'newest' ? 'bg-shopay-purple/10 text-shopay-purple font-bold' : 'text-shopay-black hover:bg-shopay-gray-light'}`}>
                الأحدث
              </Link>
              <Link href={buildUrl({ sort: 'price_asc', page: 1 })} className={`p-2 text-sm rounded ${sort === 'price_asc' ? 'bg-shopay-purple/10 text-shopay-purple font-bold' : 'text-shopay-black hover:bg-shopay-gray-light'}`}>
                السعر: الأقل إلى الأعلى
              </Link>
              <Link href={buildUrl({ sort: 'price_desc', page: 1 })} className={`p-2 text-sm rounded ${sort === 'price_desc' ? 'bg-shopay-purple/10 text-shopay-purple font-bold' : 'text-shopay-black hover:bg-shopay-gray-light'}`}>
                السعر: الأعلى إلى الأقل
              </Link>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="bg-white p-4 rounded-xl border border-shopay-gray-light">
            <h3 className="font-bold text-shopay-black mb-4">التصنيفات</h3>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              <Link href={buildUrl({ category: undefined, page: 1 })} className={`p-2 text-sm rounded ${!categoryFilter ? 'bg-shopay-purple/10 text-shopay-purple font-bold' : 'text-shopay-black hover:bg-shopay-gray-light'}`}>
                الكل
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} href={buildUrl({ category: cat.id, page: 1 })} className={`p-2 text-sm rounded ${categoryFilter === cat.id ? 'bg-shopay-purple/10 text-shopay-purple font-bold' : 'text-shopay-black hover:bg-shopay-gray-light'}`}>
                  {cat.nameAr}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="w-full lg:w-3/4">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination 
                  totalPages={totalPages} 
                  currentPage={page} 
                  createPageURL={(pageNumber) => buildUrl({ page: Number(pageNumber) })}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20 text-shopay-black/50 flex flex-col items-center bg-white rounded-xl border border-shopay-gray-light">
              <SearchIcon className="w-12 h-12 text-shopay-black/20 mb-4" />
              لا توجد نتائج مطابقة لبحثك في هذا التصنيف. جرب إزالة الفلاتر أو تغيير الكلمات.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
