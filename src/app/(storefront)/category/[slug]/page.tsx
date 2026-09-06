/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import CategoryFilters from "@/components/category/CategoryFilters";
import SubCategoryChips from "@/components/category/SubCategoryChips";
import Pagination from "@/components/ui/Pagination";

export default async function CategoryPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isAll = slug === 'all';
  let category = null;
  
  if (!isAll) {
    category = await prisma.category.findUnique({
      where: { codePrefix: slug }
    });

    if (!category) {
      notFound();
    }
  }

  const categoryName = isAll ? 'الكل' : category?.nameAr;

  // استخراج معامل التفرع (subCategory)
  const subCategory = typeof resolvedSearchParams.subCategory === 'string' && resolvedSearchParams.subCategory.trim() !== ''
    ? resolvedSearchParams.subCategory.trim()
    : undefined;

  // جلب التفرعات المتاحة فعلياً داخل هذا القسم فقط (التي تمتلك منتجات نشطة)
  let subCategories: string[] = [];
  if (!isAll && category) {
    const distinctSubCategories = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        subCategoryLabel: { not: null },
        isActive: true,
      },
      select: {
        subCategoryLabel: true,
      },
      distinct: ['subCategoryLabel'],
    });

    subCategories = distinctSubCategories
      .map((p) => p.subCategoryLabel!)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'ar'));
  }

  // Filters logic: بناء شروط الاستعلام (whereClause) شاملاً القسم والتفرع والسعر والحالة النشطة
  const minPrice = resolvedSearchParams.min ? parseFloat(resolvedSearchParams.min as string) : undefined;
  const maxPrice = resolvedSearchParams.max ? parseFloat(resolvedSearchParams.max as string) : undefined;
  const sort = resolvedSearchParams.sort as string || "newest";

  const whereClause: any = { 
    isActive: true 
  };
  
  if (!isAll && category) {
    whereClause.categoryId = category.id;
  }

  // بناء whereClause شاملاً subCategoryLabel قبل تنفيذ أي استعلام لحساب الترقيم بدقة
  if (subCategory && subCategory !== 'all') {
    whereClause.subCategoryLabel = subCategory;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) whereClause.price.gte = minPrice;
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
  }

  let orderBy: any = { id: 'desc' }; // default newest
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };

  // حساب الترقيم (Pagination Logic) بالاعتماد على نفس كائن whereClause المفلتر
  const ITEMS_PER_PAGE = 24;
  const currentPage = Math.max(1, Number(resolvedSearchParams.page) || 1);
  
  // استعلام totalProducts يعتمد حصراً على whereClause المفلتر بالتفرع
  const totalProducts = await prisma.product.count({
    where: whereClause
  });
  
  // ضبط حساب إجمالي الصفحات بدقة لعكس التصفية
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const products = await prisma.product.findMany({
    where: whereClause,
    include: { category: true },
    skip,
    take: ITEMS_PER_PAGE,
    orderBy
  });


  const subCategoryParam = subCategory ? `&subCategory=${encodeURIComponent(subCategory)}` : '';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-shopay-black/50 mb-6 flex items-center gap-2">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-shopay-black font-semibold">{categoryName}</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 hidden md:block">
          <CategoryFilters />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-shopay-black">{categoryName}</h1>
            <span className="text-shopay-black/50 text-sm">
              {totalProducts > 0 ? `إجمالي المنتجات: ${totalProducts}` : '0 منتجات'}
            </span>
          </div>

          {/* Subcategory Chips */}
          {!isAll && (
            <div className="mb-6">
              <SubCategoryChips
                subCategories={subCategories}
                activeSubCategory={subCategory}
              />
            </div>
          )}

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
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            createPageURL={(pageNumber) => `/category/${slug}?page=${pageNumber}${minPrice ? `&min=${minPrice}` : ''}${maxPrice ? `&max=${maxPrice}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}${subCategoryParam}`}
          />

        </div>
      </div>
    </div>
  );
}

