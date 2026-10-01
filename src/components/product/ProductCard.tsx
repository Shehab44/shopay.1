"use client";
import Link from "next/link";
import { Plus, Heart } from "lucide-react";
import ProductImage from "./ProductImage";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";

type ProductCardProps = {
  product: Prisma.ProductGetPayload<{}>;
};

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      matCode: product.matCode,
      price: product.price,
      mainImageUrl: product.mainImageUrl || `/images/products/${product.matCode}.jpg`,
      quantity: 1,
    });
    toast.success("تم إضافة المنتج للسلة");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success("تمت الإضافة للمفضلة (قريباً)");
  };

  return (
    <Link href={`/product/${product.id}`} className="group block bg-white rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-transparent hover:border-gray-100 relative h-full flex flex-col">
      
      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className="absolute top-4 left-4 z-10 w-8 h-8 bg-white/80 backdrop-blur border border-gray-100 text-shopay-purple rounded-full flex items-center justify-center shadow-sm hover:bg-shopay-purple hover:text-white transition-colors"
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* Image */}
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-110">
          <ProductImage
            matCode={product.matCode}
            databaseImageUrl={product.mainImageUrl}
            alt={product.nameAr}
            fill
            className="object-contain p-4"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 text-center">
        <h3 className="font-bold text-shopay-black text-sm md:text-base leading-tight mb-2 line-clamp-2 transition-colors group-hover:text-shopay-purple">
          {product.nameAr}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-center gap-1">
          <span className="font-black text-shopay-black text-lg">
            {product.price.toFixed(2)}
          </span>
          <span className="font-bold text-gray-500 text-sm">{CURRENCY_SYMBOL}</span>
        </div>
      </div>

      {/* Add to Cart Floating Button */}
      <button 
        onClick={handleAddToCart}
        className="absolute bottom-4 left-4 w-10 h-10 bg-shopay-purple text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform z-10"
      >
        <Plus className="w-5 h-5" />
      </button>
    </Link>
  );
}
