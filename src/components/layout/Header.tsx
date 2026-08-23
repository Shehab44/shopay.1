import Link from 'next/link';
import { ShoppingCart, User, Heart, Menu } from 'lucide-react';
import CartIcon from './CartIcon';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-shopay-white border-b border-shopay-gray-light shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-shopay-black">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-shopay-gradient tracking-wide font-sans">SHOPAY</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:block flex-1 max-w-xl mx-8">
          <SearchBar />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/account" className="text-shopay-black hover:text-shopay-purple transition-colors">
            <User className="w-6 h-6" />
          </Link>
          <Link href="/account/wishlist" className="hidden sm:block text-shopay-black hover:text-shopay-purple transition-colors">
            <Heart className="w-6 h-6" />
          </Link>
          <CartIcon />
        </div>
        
      </div>
      
      {/* Mobile Search */}
      <div className="lg:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  );
}
