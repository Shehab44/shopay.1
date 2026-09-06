"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Package, ShoppingBag, UploadCloud, Settings } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-shopay-gray-light overflow-hidden" dir="rtl">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-shopay-black text-shopay-white flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-shopay-white/10">
          <Link href="/admin" className="text-xl font-bold text-shopay-gradient bg-shopay-white px-2 py-1 rounded" onClick={() => setIsSidebarOpen(false)}>
            SHOPAY ADMIN
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-shopay-white/10 rounded-lg text-shopay-white/70"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-6 py-4 rounded-lg hover:bg-shopay-white/10 transition-colors">
            <Home className="w-5 h-5 text-shopay-purple-light" />
            <span>لوحة القيادة</span>
          </Link>
          <Link href="/admin/products" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-6 py-4 rounded-lg hover:bg-shopay-white/10 transition-colors">
            <Package className="w-5 h-5 text-shopay-purple-light" />
            <span>إدارة المنتجات</span>
          </Link>
          <Link href="/admin/orders" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-6 py-4 rounded-lg hover:bg-shopay-white/10 transition-colors">
            <ShoppingBag className="w-5 h-5 text-shopay-purple-light" />
            <span>الطلبات</span>
          </Link>
          <Link href="/admin/import" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-6 py-4 rounded-lg hover:bg-shopay-white/10 transition-colors">
            <UploadCloud className="w-5 h-5 text-shopay-purple-light" />
            <span>مزامنة الأسعار</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-shopay-white/10">
          <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-6 py-4 rounded-lg hover:bg-shopay-white/10 transition-colors text-shopay-gray-light/60">
            <Settings className="w-5 h-5" />
            <span>العودة للمتجر</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        <header className="h-16 bg-white border-b border-shopay-gray-light flex items-center px-4 md:px-8 shadow-sm gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-shopay-black hover:bg-shopay-gray-light rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-shopay-black">لوحة التحكم</h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
