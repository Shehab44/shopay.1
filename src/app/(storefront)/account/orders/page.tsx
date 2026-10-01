import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { Package, Search } from "lucide-react";
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

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const userId = parseInt((session.user as any).id);

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: { nameAr: true, mainImageUrl: true }
          }
        }
      },
    }
  });

  return (
    <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden min-h-[500px]">
      <div className="p-6 border-b border-shopay-gray-light">
        <h2 className="text-xl font-bold text-shopay-black">سجل الطلبات</h2>
      </div>
      
      {orders.length === 0 ? (
        <div className="p-12 text-center text-shopay-black/50 h-full flex flex-col items-center justify-center">
          <Package className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg mb-2">ليس لديك أي طلبات سابقة</p>
          <p className="text-sm">عندما تقوم بإنشاء طلب، سيظهر هنا لمتابعته.</p>
          <Link href="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-shopay-gradient text-white rounded-lg font-bold hover:opacity-90 transition-opacity">
            <Search className="w-5 h-5" />
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-shopay-gray-light">
          {orders.map(order => (
            <div key={order.id} className="p-4 sm:p-6 hover:bg-shopay-gray-light/30 transition-colors">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-shopay-black text-lg mb-1">طلب #{order.id}</div>
                  <div className="text-sm text-shopay-black/50">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <div className="font-bold text-shopay-purple text-lg">
                    {CURRENCY_SYMBOL}{order.total}
                  </div>
                </div>
              </div>
              
              <div className="bg-shopay-gray-light/50 rounded-xl p-4">
                <div className="text-sm font-bold text-shopay-black mb-3">محتويات الطلب ({order.items.length} عناصر)</div>
                <div className="flex flex-wrap gap-2">
                  {order.items.map(item => (
                    <div key={item.id} className="bg-white border border-shopay-gray-light rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                      <span className="font-medium truncate max-w-[150px]">{item.product?.nameAr || "منتج محذوف"}</span>
                      <span className="text-shopay-black/50">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
