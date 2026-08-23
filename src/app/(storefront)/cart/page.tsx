import { CURRENCY_SYMBOL } from "@/lib/constants";
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { useCartStore } from "@/lib/store/cartStore";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[60vh] flex items-center justify-center">جاري التحميل...</div>;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-shopay-gray-light rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-shopay-black/30" />
        </div>
        <h2 className="text-3xl font-bold text-shopay-black mb-4">سلة مشترياتك فارغة</h2>
        <p className="text-shopay-black/60 mb-8 max-w-md">
          لم تقم بإضافة أي منتجات إلى سلتك حتى الآن. استكشف متجرنا واكتشف عروضنا المميزة.
        </p>
        <Link 
          href="/" 
          className="bg-shopay-gradient text-shopay-white px-8 py-3 rounded-full font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          ابدأ التسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/" className="text-shopay-black/50 hover:text-shopay-purple">
          الرئيسية
        </Link>
        <span className="text-shopay-black/50">/</span>
        <span className="text-shopay-black font-bold">سلة المشتريات</span>
      </div>

      <h1 className="text-3xl font-bold text-shopay-black mb-8">سلة المشتريات</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden">
            <div className="p-6 border-b border-shopay-gray-light bg-shopay-gray-light/30 flex items-center justify-between">
              <span className="font-bold text-shopay-black text-lg">المنتجات ({items.length})</span>
            </div>
            
            <div className="divide-y divide-shopay-gray-light">
              {items.map((item) => (
                <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="relative w-24 h-24 bg-shopay-gray-light rounded-xl overflow-hidden shrink-0 border border-shopay-black/5">
                    <ProductImage matCode={item.matCode} databaseImageUrl={item.mainImageUrl} alt={item.nameAr} fill className="object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-shopay-black/50 text-xs mb-1">رمز المادة: {item.matCode}</div>
                    <Link href={`/product/${item.matCode}`} className="font-bold text-shopay-black text-lg hover:text-shopay-purple transition-colors truncate block">
                      {item.nameAr}
                    </Link>
                    <div className="text-shopay-purple font-semibold mt-1">
                      {CURRENCY_SYMBOL}{item.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 mt-4 sm:mt-0">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-shopay-gray-light rounded-full h-10 w-28 bg-shopay-white shrink-0">
                      <button 
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="w-8 h-full flex items-center justify-center text-shopay-black hover:text-shopay-purple"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center font-bold text-sm">{item.quantity}</div>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center text-shopay-black hover:text-shopay-purple"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="font-bold text-shopay-black text-lg min-w-[80px] text-left">
                      {CURRENCY_SYMBOL}{(item.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-shopay-gray-light rounded-2xl p-6 lg:p-8 sticky top-24">
            <h2 className="text-xl font-bold text-shopay-black mb-6">ملخص الطلب</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-shopay-black/70">
                <span>المجموع الفرعي</span>
                <span className="font-semibold text-shopay-black">{CURRENCY_SYMBOL}{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-shopay-black/70">
                <span>رسوم التوصيل</span>
                <span className="text-shopay-purple font-semibold text-sm">تُحسب في الخطوة القادمة</span>
              </div>
            </div>
            
            <div className="border-t border-shopay-black/10 pt-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="font-bold text-shopay-black text-lg">الإجمالي</span>
                <span className="font-bold text-shopay-purple text-2xl">{CURRENCY_SYMBOL}{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full bg-shopay-gradient text-shopay-white h-12 rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              متابعة عملية الشراء
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-shopay-black/50">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              نضمن لك أسعار الجملة المباشرة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
