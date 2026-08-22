import prisma from "@/lib/db";
import Link from "next/link";
import { Eye, CheckCircle, Clock, XCircle } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      address: true,
      items: {
        include: {
          products: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-shopay-black">إدارة الطلبات</h2>
      </div>

      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-shopay-gray-light/50 text-shopay-black/70 text-sm">
              <tr>
                <th className="px-6 py-3 font-semibold">رقم الطلب</th>
                <th className="px-6 py-3 font-semibold">تاريخ الطلب</th>
                <th className="px-6 py-3 font-semibold">العميل</th>
                <th className="px-6 py-3 font-semibold">الإجمالي</th>
                <th className="px-6 py-3 font-semibold">الحالة</th>
                <th className="px-6 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shopay-gray-light">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-shopay-gray-light/30">
                  <td className="px-6 py-4 font-semibold text-shopay-black">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 text-shopay-black/70 text-sm">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-shopay-black">{order.user?.fullName}</div>
                    <div className="text-shopay-black/50 text-sm">{order.user?.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-shopay-purple">
                    ${order.total?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700">
                        <Clock className="w-3 h-3" />
                        قيد الانتظار
                      </span>
                    )}
                    {order.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        مكتمل
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" />
                        ملغي
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-shopay-black/50 hover:text-shopay-purple p-2 bg-shopay-gray-light rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="text-center py-12 text-shopay-black/50 flex flex-col items-center">
              <Clock className="w-12 h-12 text-shopay-black/20 mb-4" />
              لا يوجد طلبات حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
