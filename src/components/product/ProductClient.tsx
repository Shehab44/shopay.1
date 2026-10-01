"use client";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";
import ProductImage from "../ui/ProductImage";
import { Prisma } from "@prisma/client";
import { ShoppingCart, Check, AlertCircle, Info, ShieldCheck, Truck } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { motion } from "framer-motion";

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
    toast.success("تم إضافة المنتج إلى السلة بنجاح!");
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-sm text-shopay-black/50 mb-8 flex items-center gap-2 font-medium"
      >
        <span className="hover:text-shopay-purple cursor-pointer transition-colors">الرئيسية</span>
        <span>/</span>
        <span className="hover:text-shopay-purple cursor-pointer transition-colors">{product.category?.nameAr || "قسم عام"}</span>
        <span>/</span>
        <span className="text-shopay-black font-bold truncate">{product.nameAr}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.4 }}
          className="bg-shopay-white rounded-3xl aspect-square relative overflow-hidden border border-shopay-gray-light shadow-lg flex items-center justify-center p-8 group"
        >
          <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-105">
            <ProductImage
              matCode={product.matCode}
              databaseImageUrl={product.mainImageUrl}
              alt={product.nameAr}
              fill
              className="object-contain"
            />
          </div>
          {product.isFeatured && (
            <div className="absolute top-6 right-6 bg-shopay-purple text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md z-10">
              منتج مميز
            </div>
          )}
        </motion.div>

        {/* Product Details */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="mb-3 text-shopay-black/50 text-sm font-bold bg-shopay-gray-light w-fit px-3 py-1 rounded-md">
            رمز المنتج: <span dir="ltr">{product.matCode}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-shopay-black mb-6 leading-tight">
            {product.nameAr}
          </h1>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-5xl font-black text-shopay-purple">
              {CURRENCY_SYMBOL}{product.price.toFixed(2)}
            </span>
            <span className="text-lg font-medium text-shopay-black/50">شامل الضريبة</span>
          </div>

          {/* Description Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-shopay-black flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-shopay-purple" />
              وصف المنتج
            </h3>
            <div className="bg-shopay-white border border-shopay-gray-light p-5 rounded-2xl shadow-sm text-shopay-black/80 leading-relaxed min-h-[100px]">
              {product.description ? (
                <p className="whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p className="text-shopay-black/40 italic text-center py-4">لم يتم إضافة وصف مفصل لهذا المنتج بعد.</p>
              )}
            </div>
          </div>

          {/* Add to Cart Controls */}
          <div className="mt-auto bg-shopay-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-shopay-gray-light">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center bg-shopay-gray-light rounded-full h-14 w-36 shrink-0 border border-shopay-black/5">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-full flex items-center justify-center text-xl text-shopay-black hover:text-shopay-purple transition-colors font-medium"
                >
                  -
                </button>
                <div className="flex-1 text-center font-bold text-lg select-none">{quantity}</div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-full flex items-center justify-center text-xl text-shopay-black hover:text-shopay-purple transition-colors font-medium"
                >
                  +
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-shopay-purple/10 text-shopay-purple h-14 rounded-full font-bold hover:bg-shopay-purple hover:text-white transition-all duration-300 flex items-center justify-center gap-2 border border-shopay-purple/20"
              >
                <ShoppingCart className="w-5 h-5" />
                أضف للسلة
              </button>
            </div>
            <button 
              onClick={() => {
                handleAddToCart();
                window.location.href = '/checkout';
              }}
              className="w-full bg-shopay-gradient text-white h-14 rounded-full font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 text-lg"
            >
              شراء الآن
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center justify-center p-4 bg-shopay-gray-light/50 rounded-2xl text-center gap-2">
              <ShieldCheck className="w-6 h-6 text-shopay-purple" />
              <span className="text-xs font-bold text-shopay-black/70">منتج أصلي 100%</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-shopay-gray-light/50 rounded-2xl text-center gap-2">
              <AlertCircle className="w-6 h-6 text-shopay-purple" />
              <span className="text-xs font-bold text-shopay-black/70">إرجاع سهل خلال 14 يوم</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-shopay-gray-light/50 rounded-2xl text-center gap-2">
              <Truck className="w-6 h-6 text-shopay-purple" />
              <span className="text-xs font-bold text-shopay-black/70">شحن سريع وآمن</span>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
