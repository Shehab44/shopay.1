import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { Package } from "lucide-react";
import Link from "next/link";
import { CURRENCY_SYMBOL } from "@/lib/constants";

function getStatusText(status: string) {
  switch (status) {
    case "pending": return "قيد المراجعة";
    case "processing": return "جاري التجهيز";
    case "shipped": return "تم الشحن";
    case "delivered": return "مكتمل";
    case "cancelled": return "ملغي";
    default: return status;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "processing": return "bg-blue-100 text-blue-800";
    case "shipped": return "bg-purple-100 text-purple-800";
    case "delivered": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export default async function AccountDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null; // Handled by layout redirect
  }

  const userId = parseInt((session.user as any).id);

  const [totalOrders, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        items: true,
      }
    })
  ]);

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-shopay-gradient text-shopay-white p-6 rounded-2xl shadow-md">
          <h3 className="font-bold mb-1 opacity-90">مرحباً بك في SHOPAY</h3>
          <p className="text-sm opacity-80 mb-4">هذه لوحة تحكم حسابك حيث يمكنك إدارة طلباتك ومعلوماتك الشخصية بكل سهولة.</p>
          <div className="text-2xl font-bold truncate">{session.user.name || "عزيزي العميل"}</div>
        </div>
        
        <div className="bg-shopay-white border border-shopay-gray-light p-6 rounded-2xl shadow-sm flex flex-col justify-center">
          <div className="text-shopay-black/50 text-sm font-semibold mb-1">إجمالي طلباتك</div>
          <div className="text-3xl font-bold text-shopay-black">{totalOrders}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-shopay-gray-light flex justify-between items-center">
          <h2 className="text-xl font-bold text-shopay-black">أحدث الطلبات</h2>
          {totalOrders > 0 && (
            <Link href="/account/orders" className="text-sm text-shopay-purple hover:underline font-bold">
              عرض الكل
            </Link>
          )}
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-shopay-black/50">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>لا توجد طلبات سابقة في حسابك.</p>
            <Link href="/" className="inline-block mt-4 text-shopay-purple font-bold hover:underline">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-shopay-gray-light">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 sm:p-6 hover:bg-shopay-gray-light/30 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <div className="font-bold text-shopay-black text-lg mb-1">طلب #{order.id}</div>
                  <div className="text-sm text-shopay-black/50 mb-2">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="font-bold text-shopay-purple">
                    {CURRENCY_SYMBOL}{order.total}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <Link 
                    href={`/account/orders/${order.id}`}
                    className="ml-auto sm:ml-0 px-4 py-2 bg-shopay-white border border-shopay-gray-light text-shopay-black rounded-lg text-sm font-bold hover:border-shopay-purple hover:text-shopay-purple transition-colors"
                  >
                    التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
