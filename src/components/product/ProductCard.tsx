import Link from 'next/link';
import ProductImage from '../ui/ProductImage';
import { ShoppingCart } from 'lucide-react';
import { Prisma } from '@prisma/client';

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true }
}>;

export default function ProductCard({ product }: { product: ProductWithCategory }) {

  return (
    <div className="bg-shopay-white rounded-xl border border-shopay-gray-light overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
      
      {/* Image Container */}
      <Link href={`/product/${product.matCode}`} className="relative aspect-square overflow-hidden bg-shopay-gray-light block">
        <ProductImage 
          matCode={product.matCode}
          databaseImageUrl={product.mainImageUrl}
          alt={product.nameAr}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/category/${product.category?.codePrefix}`} className="text-shopay-black/50 text-xs mb-1 hover:text-shopay-purple transition-colors block">
          {product.category?.nameAr}
        </Link>
        <Link href={`/product/${product.matCode}`} className="text-shopay-black font-semibold text-sm mb-2 line-clamp-2 hover:text-shopay-purple transition-colors">
          {product.nameAr}
        </Link>
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-shopay-gray-light/50">
          <div>
            <div className="text-shopay-purple font-bold text-lg">
              ${product.price.toFixed(2)}
            </div>
          </div>
          
          <button className="w-10 h-10 rounded-full bg-shopay-gray-light flex items-center justify-center text-shopay-black hover:bg-shopay-gradient hover:text-shopay-white transition-all duration-300 shadow-sm active:scale-95" aria-label="أضف للسلة">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
