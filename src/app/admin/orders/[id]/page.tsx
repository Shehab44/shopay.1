import { CURRENCY_SYMBOL } from "@/lib/constants";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, User, Package } from "lucide-react";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) return notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      address: true,
      items: {
        include: {
          product: true // Now it's product since we rewrote the schema (wait, did we? Let's check schema!)
        }
      }
    }
  });

  if (!order) return notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="text-shopay-black/50 hover:text-shopay-purple transition-colors">
          <ArrowRight className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-shopay-black">تفاصيل الطلب #{order.id}</h2>
        <div className="mr-auto">
          <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-shopay-white p-6 rounded-2xl shadow-sm border border-shopay-gray-light">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-shopay-purple" />
            بيانات العميل
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-shopay-black/50">الاسم</span>
              <span className="font-semibold">{order.user?.fullName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-shopay-black/50">رقم الهاتف</span>
              <span className="font-semibold">{order.user?.phone}</span>
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-shopay-white p-6 rounded-2xl shadow-sm border border-shopay-gray-light">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-shopay-purple" />
            عنوان التوصيل
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-shopay-black/50">المدينة</span>
              <span className="font-semibold">{order.address?.city}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-shopay-black/50">المنطقة</span>
              <span className="font-semibold">{order.address?.area || '-'}</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-shopay-black/50">التفاصيل</span>
              <span className="font-semibold leading-relaxed">{order.address?.fullAddress}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-shopay-white p-6 rounded-2xl shadow-sm border border-shopay-gray-light">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-shopay-purple" />
          المنتجات
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-shopay-gray-light/50 text-shopay-black/70 text-sm">
              <tr>
                <th className="px-4 py-3 font-semibold">المنتج</th>
                <th className="px-4 py-3 font-semibold">الكود</th>
                <th className="px-4 py-3 font-semibold">السعر</th>
                <th className="px-4 py-3 font-semibold">الكمية</th>
                <th className="px-4 py-3 font-semibold">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shopay-gray-light">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold">
                    {item.product?.nameAr || 'منتج غير معروف'}
                  </td>
                  <td className="px-4 py-3 text-shopay-black/70 font-mono text-sm">
                    {item.product?.matCode || '-'}
                  </td>
                  <td className="px-4 py-3">{CURRENCY_SYMBOL}{item.unitPriceAtOrder?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3 font-bold text-shopay-purple">
                    {CURRENCY_SYMBOL}{((item.unitPriceAtOrder || 0) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-shopay-gray-light">
              <tr>
                <td colSpan={4} className="px-4 py-4 text-left font-bold text-lg">المجموع الكلي</td>
                <td className="px-4 py-4 font-black text-xl text-shopay-purple">
                  {CURRENCY_SYMBOL}{order.total?.toFixed(2) || '0.00'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
