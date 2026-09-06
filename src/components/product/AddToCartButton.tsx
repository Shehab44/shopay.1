/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { toast } from 'sonner';

export default function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      matCode: product.matCode,
      price: product.price,
      mainImageUrl: product.mainImageUrl || '',
      quantity: 1,
    });
    toast.success("تم إضافة المنتج للسلة بنجاح!");
  };

  if (product.price <= 0) {
    return (
      <button 
        disabled
        className="px-3 py-1 rounded text-xs font-bold bg-shopay-gray-light text-shopay-black/50 cursor-not-allowed"
      >
        غير متوفر للبيع
      </button>
    );
  }

  return (
    <button 
      onClick={handleAdd}
      className="w-10 h-10 rounded-full bg-shopay-gray-light flex items-center justify-center text-shopay-black hover:bg-shopay-gradient hover:text-shopay-white transition-all duration-300 shadow-sm active:scale-95" 
      aria-label="أضف للسلة"
    >
      <ShoppingCart className="w-5 h-5" />
    </button>
  );
}
