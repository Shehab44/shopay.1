import Link from 'next/link';
import { Home, Package, ShoppingBag, UploadCloud, Settings } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-shopay-gray-light overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-shopay-black text-shopay-white flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center justify-center border-b border-shopay-white/10">
          <Link href="/admin" className="text-xl font-bold text-shopay-gradient bg-shopay-white px-2 py-1 rounded">
            SHOPAY ADMIN
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-shopay-white/10 transition-colors">
            <Home className="w-5 h-5 text-shopay-purple-light" />
            <span>لوحة القيادة</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-shopay-white/10 transition-colors">
            <Package className="w-5 h-5 text-shopay-purple-light" />
            <span>إدارة المنتجات</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-shopay-white/10 transition-colors">
            <ShoppingBag className="w-5 h-5 text-shopay-purple-light" />
            <span>الطلبات</span>
          </Link>
          <Link href="/admin/import" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-shopay-white/10 transition-colors">
            <UploadCloud className="w-5 h-5 text-shopay-purple-light" />
            <span>مزامنة الأسعار</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-shopay-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-shopay-white/10 transition-colors text-shopay-gray-light/60">
            <Settings className="w-5 h-5" />
            <span>العودة للمتجر</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        <header className="h-16 bg-white border-b border-shopay-gray-light flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-shopay-black">لوحة التحكم</h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
