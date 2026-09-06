import { User, Package, Heart, Settings } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-shopay-black mb-8">حسابي</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light p-4 shadow-sm">
            <div className="flex items-center gap-4 p-4 border-b border-shopay-gray-light mb-2">
              <div className="w-12 h-12 bg-shopay-purple/10 text-shopay-purple rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                ع
              </div>
              <div>
                <div className="font-bold text-shopay-black">عميل زائر</div>
                <div className="text-xs text-shopay-black/50">تسجيل الدخول قريباً</div>
              </div>
            </div>
            
            <nav className="flex flex-col space-y-1">
              <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-shopay-purple/5 text-shopay-purple font-bold">
                <User className="w-5 h-5" />
                لوحة التحكم
              </Link>
              <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-lg text-shopay-black/70 hover:bg-shopay-gray-light transition-colors hover:text-shopay-black">
                <Package className="w-5 h-5" />
                طلباتي
              </Link>
              <Link href="/account/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-lg text-shopay-black/70 hover:bg-shopay-gray-light transition-colors hover:text-shopay-black">
                <Heart className="w-5 h-5" />
                المفضلة
              </Link>
              <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-lg text-shopay-black/70 hover:bg-shopay-gray-light transition-colors hover:text-shopay-black">
                <Settings className="w-5 h-5" />
                إعدادات الحساب
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-shopay-gradient text-shopay-white p-6 rounded-2xl shadow-md">
              <h3 className="font-bold mb-1 opacity-90">مرحباً بك في SHOPAY</h3>
              <p className="text-sm opacity-80 mb-4">نحن نعمل على تطوير نظام تسجيل الدخول وتتبع الطلبات.</p>
              <div className="text-2xl font-bold">حساب زائر</div>
            </div>
            
            <div className="bg-shopay-white border border-shopay-gray-light p-6 rounded-2xl shadow-sm flex flex-col justify-center">
              <div className="text-shopay-black/50 text-sm font-semibold mb-1">إجمالي طلباتك</div>
              <div className="text-3xl font-bold text-shopay-black">0</div>
            </div>
          </div>

          <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden">
            <div className="p-6 border-b border-shopay-gray-light">
              <h2 className="text-xl font-bold text-shopay-black">أحدث الطلبات</h2>
            </div>
            <div className="p-12 text-center text-shopay-black/50">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>ميزة تتبع الطلبات للعملاء قيد التطوير وسيتم إطلاقها قريباً.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
