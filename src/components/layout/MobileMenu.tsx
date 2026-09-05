"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, Heart } from "lucide-react";

export default function MobileMenu({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="lg:hidden text-shopay-black">
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-shopay-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-shopay-gray-light">
          <span className="text-xl font-bold text-shopay-gradient tracking-wide font-sans" dir="ltr">SHOPAY</span>
          <button onClick={() => setIsOpen(false)} className="text-shopay-black hover:text-shopay-purple">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <Link onClick={() => setIsOpen(false)} href="/" className="text-shopay-black font-bold">الرئيسية</Link>
          <Link onClick={() => setIsOpen(false)} href="/category/all" className="text-shopay-black font-bold">كل المنتجات</Link>
          
          <div className="h-px w-full bg-shopay-gray-light my-2"></div>
          
          {categories.map((cat: any) => (
            <Link 
              key={cat.id} 
              onClick={() => setIsOpen(false)} 
              href={`/category/${cat.codePrefix}`} 
              className="text-shopay-black/80 hover:text-shopay-purple transition-colors"
            >
              {cat.nameAr}
            </Link>
          ))}

          <div className="h-px w-full bg-shopay-gray-light my-2"></div>

          <Link onClick={() => setIsOpen(false)} href="/account" className="flex items-center gap-2 text-shopay-black hover:text-shopay-purple transition-colors">
            <User className="w-5 h-5 text-shopay-purple" />
            حسابي
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/account/wishlist" className="flex items-center gap-2 text-shopay-black hover:text-shopay-purple transition-colors">
            <Heart className="w-5 h-5 text-shopay-purple" />
            المفضلة
          </Link>
        </div>
      </div>
    </>
  );
}
