import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import CategoryFilters from "@/components/category/CategoryFilters";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default async function CategoryPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const category = await prisma.category.findUnique({
    where: { codePrefix: slug }
  });

  if (!category) {
    notFound();
  }

  // Filters logic
  const minPrice = resolvedSearchParams.min ? parseFloat(resolvedSearchParams.min as string) : undefined;
  const maxPrice = resolvedSearchParams.max ? parseFloat(resolvedSearchParams.max as string) : undefined;
  const sort = resolvedSearchParams.sort as string || "newest";

  const whereClause: any = { 
    categoryId: category.id, 
    isActive: true 
  };

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) whereClause.price.gte = minPrice;
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
  }

  let orderBy: any = { id: 'desc' }; // default newest
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };

  // Pagination Logic
  const ITEMS_PER_PAGE = 24;
  const currentPage = Math.max(1, Number(resolvedSearchParams.page) || 1);
  
  const totalProducts = await prisma.product.count({
    where: whereClause
  });
  
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const products = await prisma.product.findMany({
    where: whereClause,
    include: { category: true },
    skip,
    take: ITEMS_PER_PAGE,
    orderBy
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
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 hidden md:block">
          <CategoryFilters />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-shopay-black">{category.nameAr}</h1>
            <span className="text-shopay-black/50 text-sm">
              {totalProducts > 0 ? `إجمالي المنتجات: ${totalProducts}` : '0 منتجات'}
            </span>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Link 
                href={`/category/${slug}?page=${Math.max(1, currentPage - 1)}${minPrice ? `&min=${minPrice}` : ''}${maxPrice ? `&max=${maxPrice}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full border border-shopay-gray-light hover:border-shopay-purple transition-colors ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                aria-label="الصفحة السابقة"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
              
              <div className="flex items-center gap-1 mx-2">
                <span className="font-bold text-shopay-purple">{currentPage}</span>
                <span className="text-shopay-black/50 text-sm mx-1">من</span>
                <span className="font-bold text-shopay-black/70">{totalPages}</span>
              </div>

              <Link 
                href={`/category/${slug}?page=${Math.min(totalPages, currentPage + 1)}${minPrice ? `&min=${minPrice}` : ''}${maxPrice ? `&max=${maxPrice}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full border border-shopay-gray-light hover:border-shopay-purple transition-colors ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
