"use client";

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
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      matCode: product.matCode,
      nameAr: product.nameAr,
      price: product.price,
      quantity,
      unitName: "قطعة",
      mainImageUrl: product.mainImageUrl,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-shopay-white rounded-3xl p-6 md:p-8 lg:p-12 shadow-sm border border-shopay-gray-light flex flex-col lg:flex-row gap-12">
        
        {/* Image Section */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-shopay-gray-light border border-shopay-black/5">
            <ProductImage 
              matCode={product.matCode}
              databaseImageUrl={product.mainImageUrl}
              alt={product.nameAr}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="text-shopay-black/50 text-sm mb-2">{product.category?.nameAr}</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-shopay-black mb-4 leading-tight">{product.nameAr}</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="text-sm text-shopay-black/50">(لا توجد تقييمات بعد)</span>
          </div>

          <div className="text-4xl font-bold text-shopay-purple mb-8">
            ${product.price.toFixed(2)}
          </div>

          <p className="text-shopay-black/70 mb-8 leading-relaxed max-w-xl">
            {product.description || "لا يوجد وصف متاح لهذا المنتج حالياً. جميع منتجاتنا مضمونة الجودة وتخضع لفحص شامل قبل الشحن."}
          </p>

          <div className="mt-auto pt-8 border-t border-shopay-gray-light">
            <div className="flex items-end gap-4 mb-6">
              <div className="w-32">
                <label className="block text-sm font-bold text-shopay-black mb-2">الكمية</label>
                <div className="flex items-center bg-shopay-gray-light rounded-lg border border-shopay-black/10">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-shopay-black hover:text-shopay-purple transition-colors"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent border-none focus:ring-0 text-shopay-black font-bold appearance-none p-0"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-shopay-black hover:text-shopay-purple transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className={`w-full md:w-auto flex items-center justify-center gap-2 py-4 px-12 rounded-xl font-bold text-lg transition-all duration-300 ${
                added 
                  ? 'bg-green-500 text-white shadow-green-500/30 shadow-lg' 
                  : 'bg-shopay-black text-shopay-white hover:bg-shopay-gradient shadow-xl hover:-translate-y-1'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-6 h-6" />
                  تمت الإضافة للسلة
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  أضف إلى السلة
                </>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
