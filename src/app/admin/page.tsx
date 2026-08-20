import prisma from "@/lib/db";
import { Package, Users, ShoppingBag, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const productsCount = await prisma.product.count();
  const categoriesCount = await prisma.category.count();
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-shopay-black mb-6">نظرة عامة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-shopay-white p-6 rounded-2xl border border-shopay-gray-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-shopay-purple/10 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-shopay-purple" />
          </div>
          <div>
            <div className="text-shopay-black/50 text-sm font-semibold mb-1">إجمالي المنتجات</div>
            <div className="text-2xl font-bold text-shopay-black">{productsCount}</div>
          </div>
        </div>
        
        <div className="bg-shopay-white p-6 rounded-2xl border border-shopay-gray-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-shopay-black/50 text-sm font-semibold mb-1">إجمالي الأقسام</div>
            <div className="text-2xl font-bold text-shopay-black">{categoriesCount}</div>
          </div>
        </div>
        
        <div className="bg-shopay-white p-6 rounded-2xl border border-shopay-gray-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-shopay-black/50 text-sm font-semibold mb-1">الطلبات الجديدة</div>
            <div className="text-2xl font-bold text-shopay-black">0</div>
          </div>
        </div>
        
        <div className="bg-shopay-white p-6 rounded-2xl border border-shopay-gray-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="text-shopay-black/50 text-sm font-semibold mb-1">العملاء</div>
            <div className="text-2xl font-bold text-shopay-black">0</div>
          </div>
        </div>
      </div>
      
      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm p-6">
        <h3 className="text-lg font-bold text-shopay-black mb-4">أحدث الطلبات</h3>
        <div className="text-center py-12 text-shopay-black/50">
          لا يوجد طلبات حالياً (قيد التطوير في المرحلة القادمة)
        </div>
      </div>
    </div>
  );
}
