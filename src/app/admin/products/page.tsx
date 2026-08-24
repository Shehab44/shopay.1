import { CURRENCY_SYMBOL } from "@/lib/constants";
import prisma from "@/lib/db";
import Link from "next/link";
import { Search } from "lucide-react";
import ProductListClient from "./ProductListClient";
import NoImageFilter from "./NoImageFilter";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; noImage?: string }>;
}) {
  const query = await searchParams;
  const q = query.q || "";
  const noImage = query.noImage === "true";
  const page = parseInt(query.page || "1");
  const limit = 30;
  
  const where: any = {};
  if (q) {
    where.OR = [
      { nameAr: { contains: q } },
      { matCode: { contains: q } },
    ];
  }
  if (noImage) {
    where.mainImageUrl = null;
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
        <h2 className="text-2xl font-bold text-shopay-black">إدارة المنتجات</h2>
      </div>

      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden">
        <div className="p-4 border-b border-shopay-gray-light flex items-center gap-4">
          <form className="relative flex-1 max-w-md" method="GET" action="/admin/products">
            <input 
              type="text" 
              name="q"
              placeholder="ابحث برمز المادة أو اسم المنتج..." 
              defaultValue={q}
              className="w-full bg-shopay-gray-light text-shopay-black px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopay-purple/50"
            />
            {noImage && <input type="hidden" name="noImage" value="true" />}
            <button type="submit" className="absolute right-3 top-2.5 text-shopay-black/50 hover:text-shopay-purple">
              <Search className="w-5 h-5" />
            </button>
          </form>
          <div className="flex items-center gap-2">
            <NoImageFilter q={q} noImage={noImage} />
          </div>
        </div>
        
        <ProductListClient initialProducts={products} q={q} noImage={noImage} />
        
        <div className="p-4 border-t border-shopay-gray-light flex items-center justify-between text-sm text-shopay-black/70">
          <div>
            إجمالي المنتجات المطابقة: <span className="font-bold">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
