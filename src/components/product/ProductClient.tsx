"use client";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";
import ProductImage from "../ui/ProductImage";
import { Prisma } from "@prisma/client";
import { useCartStore } from "@/lib/store/cartStore";
import { Heart, Share2, Plus, Minus, Gift } from "lucide-react";
import Link from "next/link";

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

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDate = deliveryDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-shopay-purple transition-colors">الصفحة الرئيسية</Link>
          <span>/</span>
          <Link href={`/category/${product.categoryId}`} className="hover:text-shopay-purple transition-colors">{product.category?.nameAr || "قسم عام"}</Link>
          <span>/</span>
          <span className="text-gray-800">{product.nameAr}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Image (Right Side in RTL) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 flex items-center justify-center border border-gray-100 shadow-sm aspect-square relative">
            <ProductImage
              matCode={product.matCode}
              databaseImageUrl={product.mainImageUrl}
              alt={product.nameAr}
              fill
              className="object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Product Details (Middle) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <Link href={`/category/${product.categoryId}`} className="text-shopay-purple font-bold text-sm mb-2 block hover:underline">
                {product.category?.nameAr || "قسم عام"}
              </Link>
              
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-snug">
                {product.nameAr}
              </h1>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-black text-gray-900">
                  {product.price.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-gray-600">{CURRENCY_SYMBOL}</span>
                <span className="text-sm text-gray-400 mr-2">شامل ضريبة القيمة المضافة</span>
              </div>

              {/* Fake Tabby Widget */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">ادفع 4 أقساط شهرية بقيمة {(product.price / 4).toFixed(2)} {CURRENCY_SYMBOL}</span>
                </div>
                <div className="flex items-center gap-1 font-black text-xs px-2 py-1 bg-[#3EFFB0] rounded">
                  tabby
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-gray-900 border-b border-gray-100 pb-2">الوصف</h3>
                <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                  {product.description || "لم يتم إضافة وصف مفصل لهذا المنتج بعد."}
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar (Left Side in RTL) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
              
              <div className="text-center mb-6">
                <div className="text-gray-500 text-sm mb-1">يصل خلال</div>
                <div className="font-bold text-gray-900">{formattedDate}</div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-center bg-gray-50 rounded-full h-12 mb-4 border border-gray-100">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-shopay-purple"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center font-bold">{quantity}</div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-shopay-purple"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-shopay-purple text-white h-12 rounded-full font-bold shadow-sm hover:bg-shopay-purple/90 transition-colors"
                >
                  أضف إلى السلة
                </button>
                <button 
                  onClick={() => {
                    handleAddToCart();
                    window.location.href = '/checkout';
                  }}
                  className="w-full bg-white text-shopay-purple border-2 border-shopay-purple h-12 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-colors"
                >
                  اشتر الآن
                </button>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <button 
                  onClick={() => toast.success("تمت الإضافة لقائمة الرغبات")}
                  className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-shopay-purple font-medium"
                >
                  <span>أضف إلى قائمة الرغبات</span>
                  <Heart className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toast.success("ميزة السجل ستتوفر قريباً")}
                  className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-shopay-purple font-medium"
                >
                  <span>أضف إلى السجل</span>
                  <Gift className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("تم نسخ رابط المنتج");
                  }}
                  className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-shopay-purple font-medium"
                >
                  <span>مشاركة</span>
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
