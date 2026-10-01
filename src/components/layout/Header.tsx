import Link from 'next/link';
import { User, Heart } from 'lucide-react';
import MobileMenu from './MobileMenu';
import prisma from '@/lib/db';
import CartIcon from './CartIcon';
import SearchBar from './SearchBar';
import Image from 'next/image';

export default async function Header() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' }
  });
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm relative">
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Top Row: Logo, Search, Actions */}
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <MobileMenu categories={categories} />
            <Link href="/" className="flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-shopay-purple tracking-wide font-sans leading-none" dir="ltr">SHOPAY</span>
              <span className="text-xs font-bold text-gray-500 tracking-widest mt-1">STORE</span>
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden lg:block flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Icons - Left */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/account" className="flex items-center gap-2 text-shopay-black hover:text-shopay-purple transition-colors font-bold text-sm">
              <User className="w-6 h-6" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </Link>
            
            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

            <Link href="/account/wishlist" className="hidden sm:flex text-shopay-black hover:text-shopay-purple transition-colors">
              <Heart className="w-6 h-6" />
            </Link>
            
            <CartIcon />
          </div>
          
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden w-full">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
