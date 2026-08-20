"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import ProductImage from "@/components/ui/ProductImage";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent, viaWhatsapp: boolean = false) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map(i => ({
            productId: i.productId,
            unitId: i.unitId,
            quantity: i.quantity,
            price: i.price
          })),
          totalAmount: getTotalPrice(),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "حدث خطأ أثناء تسجيل الطلب");

      if (viaWhatsapp) {
        // Format message for WhatsApp
        let msg = `*طلب جديد من SHOPAY*%0A`;
        msg += `الاسم: ${formData.name}%0A`;
        msg += `العنوان: ${formData.address}%0A%0A`;
        msg += `*المنتجات:*%0A`;
        items.forEach(item => {
          msg += `- ${item.nameAr} (${item.unitName}) x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}%0A`;
        });
        msg += `%0A*الإجمالي: $${getTotalPrice().toFixed(2)}*`;
        
        window.open(`https://wa.me/96100000000?text=${msg}`, '_blank');
      }

      setSuccess(true);
      clearCart();
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
        <h1 className="text-4xl font-bold text-shopay-black mb-4">تم استلام طلبك بنجاح!</h1>
        <p className="text-shopay-black/60 mb-8 max-w-md text-lg">
          شكراً لتسوقك معنا. سيقوم فريقنا بالتواصل معك قريباً لتأكيد الطلب وتحديد موعد التوصيل.
        </p>
        <p className="text-shopay-black/40 text-sm">جاري تحويلك للصفحة الرئيسية...</p>
      </div>
    );
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-shopay-black mb-8">إتمام الشراء</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Form */}
        <div className="flex-1">
          <form className="bg-shopay-white rounded-2xl border border-shopay-gray-light p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-shopay-black mb-6 border-b border-shopay-gray-light pb-4">بيانات التوصيل</h2>
            
            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-semibold">{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-shopay-black text-sm font-bold mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-shopay-gray-light text-shopay-black px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 border border-transparent focus:border-shopay-purple/30 transition-all"
                  placeholder="الاسم الثلاثي"
                />
              </div>
              <div>
                <label className="block text-shopay-black text-sm font-bold mb-2">رقم الهاتف <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-shopay-gray-light text-shopay-black px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 border border-transparent focus:border-shopay-purple/30 transition-all text-left"
                  placeholder="+961 XX XXX XXX"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-shopay-black text-sm font-bold mb-2">عنوان التوصيل بالتفصيل <span className="text-red-500">*</span></label>
              <textarea 
                required
                rows={3}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-shopay-gray-light text-shopay-black px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 border border-transparent focus:border-shopay-purple/30 transition-all"
                placeholder="المدينة، المنطقة، الشارع، البناية، الطابق..."
              ></textarea>
            </div>

            <div className="mb-8">
              <label className="block text-shopay-black text-sm font-bold mb-2">ملاحظات إضافية (اختياري)</label>
              <textarea 
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-shopay-gray-light text-shopay-black px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 border border-transparent focus:border-shopay-purple/30 transition-all"
                placeholder="أي تعليمات خاصة بالتوصيل؟"
              ></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 border-t border-shopay-gray-light pt-6">
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading || !formData.name || !formData.phone || !formData.address}
                className="flex-1 bg-shopay-black text-shopay-white h-14 rounded-xl font-bold hover:bg-shopay-black/80 transition-colors disabled:opacity-50"
              >
                {loading ? "جاري الإرسال..." : "تأكيد الطلب"}
              </button>
              
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading || !formData.name || !formData.phone || !formData.address}
                className="flex-1 bg-green-500 text-white h-14 rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                تأكيد عبر واتساب
              </button>
            </div>

          </form>
        </div>

        {/* Mini Summary */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-shopay-gray-light rounded-2xl p-6 sticky top-24">
            <h3 className="font-bold text-shopay-black mb-4">طلبك ({items.length} منتجات)</h3>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.unitId} className="flex gap-3 items-start border-b border-shopay-black/5 pb-3 last:border-0">
                  <div className="w-12 h-12 bg-white rounded border border-shopay-black/10 shrink-0 overflow-hidden relative">
                    <ProductImage matCode={item.matCode} databaseImageUrl={item.imageUrl} alt={item.nameAr} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-shopay-black truncate">{item.nameAr}</div>
                    <div className="text-xs text-shopay-black/60">{item.unitName} x {item.quantity}</div>
                    <div className="text-shopay-purple font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-shopay-black/10 pt-4 flex items-center justify-between">
              <span className="font-bold text-shopay-black">المجموع الكلي</span>
              <span className="font-bold text-shopay-purple text-xl">${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
