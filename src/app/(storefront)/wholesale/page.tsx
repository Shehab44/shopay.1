import prisma from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import { PackageOpen } from "lucide-react";

export default async function WholesalePage() {
  // Wholesale options removed per architecture simplification
  const products: any[] = [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="bg-shopay-gradient text-shopay-white rounded-3xl p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            عروض الجملة الحصرية
          </h1>
          <p className="text-lg opacity-90 leading-relaxed">
            استفد من أسعار تنافسية عند الشراء بكميات كبيرة (صناديق، طرود، كراتين). خفض تكاليفك وزد أرباحك مع تشكيلتنا الواسعة المصممة خصيصاً لتجار التجزئة.
          </p>
        </div>
        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
          <PackageOpen className="w-16 h-16 text-white" />
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-shopay-gray-light/30 rounded-2xl border border-shopay-black/5">
          <PackageOpen className="w-16 h-16 text-shopay-black/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-shopay-black mb-2">لا توجد عروض جملة حالياً</h2>
          <p className="text-shopay-black/50 max-w-md mx-auto">
            نعمل على إضافة المزيد من عروض الجملة قريباً. تابعنا للحصول على أفضل الأسعار.
          </p>
        </div>
      )}
    </div>
  );
}
