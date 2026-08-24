import prisma from "@/lib/db";
import { Package, Users, ShoppingBag, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const productsCount = await prisma.product.count();
  const categoriesCount = await prisma.category.count();
  const newOrdersCount = await prisma.order.count({ where: { status: 'pending' } });
  const customersCount = await prisma.user.count({ where: { role: 'customer' } });
  const latestOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });
  
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
            <div className="text-2xl font-bold text-shopay-black">{newOrdersCount}</div>
          </div>
        </div>
        
        <div className="bg-shopay-white p-6 rounded-2xl border border-shopay-gray-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="text-shopay-black/50 text-sm font-semibold mb-1">العملاء</div>
            <div className="text-2xl font-bold text-shopay-black">{customersCount}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm p-6">
        <h3 className="text-lg font-bold text-shopay-black mb-4">أحدث الطلبات</h3>
        {latestOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-shopay-gray-light/50 text-shopay-black/70 text-sm">
                <tr>
                  <th className="px-4 py-2 font-semibold">رقم الطلب</th>
                  <th className="px-4 py-2 font-semibold">العميل</th>
                  <th className="px-4 py-2 font-semibold">المبلغ الإجمالي</th>
                  <th className="px-4 py-2 font-semibold">الحالة</th>
                  <th className="px-4 py-2 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-shopay-gray-light">
                {latestOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-shopay-gray-light/30 text-sm">
                    <td className="px-4 py-3 font-mono text-shopay-black/70">#{order.id}</td>
                    <td className="px-4 py-3 text-shopay-black">{order.user ? (order.user.fullName || order.user.email) : 'مجهول'}</td>
                    <td className="px-4 py-3 font-semibold text-shopay-purple">${order.total ? order.total.toFixed(2) : '0.00'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status === 'pending' ? 'قيد الانتظار' :
                         order.status === 'processing' ? 'جاري التجهيز' :
                         order.status === 'completed' ? 'مكتمل' : 'ملغي'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-shopay-black/50">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-shopay-black/50">
            لا يوجد طلبات حالياً
          </div>
        )}
      </div>
    </div>
  );
}
