"use client";
import { CURRENCY_SYMBOL } from "@/lib/constants";

import { useState } from "react";
import ProductImage from "../ui/ProductImage";
import { Prisma } from "@prisma/client";
import { ShoppingCart, Check, Star, AlertCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true }
}>;

export default function ProductClient({ product }: { product: ProductWithCategory }) {
  const addItem = useCartStore((state) => state.addItem);
  
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      matCode: product.matCode,
      price: product.price,
      mainImageUrl: product.mainImageUrl || `/images/products/${product.matCode}.jpg`,
      quantity,
    });
    alert('تم إضافة المنتج إلى السلة بنجاح!');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-shopay-black/50 mb-6 flex items-center gap-2">
        <span>الرئيسية</span>
        <span>/</span>
        <span>{product.category?.nameAr}</span>
        <span>/</span>
        <span className="text-shopay-black truncate">{product.nameAr}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div className="bg-shopay-gray-light rounded-2xl aspect-square relative overflow-hidden border border-shopay-black/5">
          <ProductImage
            matCode={product.matCode}
            databaseImageUrl={product.mainImageUrl}
            alt={product.nameAr}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-2 text-shopay-black/50 text-sm">
            رمز المادة: {product.matCode}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-shopay-black mb-4 leading-tight">
            {product.nameAr}
          </h1>



          <div className="text-4xl font-bold text-shopay-purple mb-6">
            {CURRENCY_SYMBOL}{product.price.toFixed(2)}
            <span className="text-base font-normal text-shopay-black/50 ml-2">
              سعر المنتج
            </span>
          </div>

          {/* Add to Cart */}
          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center border border-shopay-gray-light rounded-full h-12 w-32 shrink-0">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center text-shopay-black hover:text-shopay-purple"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold">{quantity}</div>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center text-shopay-black hover:text-shopay-purple"
              >
                +
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-shopay-gradient text-shopay-white h-12 rounded-full font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              أضف للسلة
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-shopay-gray-light/50">
            <div className="flex items-center gap-2 text-sm text-shopay-black/70">
              <Check className="w-4 h-4 text-shopay-purple" />
              منتج أصلي 100%
            </div>
            <div className="flex items-center gap-2 text-sm text-shopay-black/70">
              <AlertCircle className="w-4 h-4 text-shopay-purple" />
              إمكانية الإرجاع
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
