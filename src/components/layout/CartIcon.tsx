"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  
  // To avoid hydration mismatch, we only render the count after mounting on client
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const itemCount = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <Link href="/cart" className="relative text-shopay-black hover:text-shopay-purple transition-colors">
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-shopay-purple text-shopay-white text-xs font-bold min-w-5 h-5 rounded-full flex items-center justify-center px-1">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
