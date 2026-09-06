"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    orderNumber: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب";
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }
    if (!formData.message.trim()) newErrors.message = "نص الرسالة مطلوب";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await submitContactForm(formData);
      if (result.success) {
        setIsSuccess(true);
      }
    } catch {
      setErrors({ global: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 shadow-sm">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-shopay-black mb-2">شكراً لتواصلك معنا</h3>
        <p className="text-shopay-black/70 leading-relaxed">تم استلام رسالتك بنجاح. سيقوم فريق خدمة العملاء بمراجعتها والرد عليك عبر البريد الإلكتروني في أقرب وقت ممكن.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-shopay-white p-6 md:p-8 rounded-2xl shadow-sm border border-shopay-gray-light">
      <h3 className="text-xl font-bold text-shopay-black mb-6">أرسل لنا رسالة</h3>
      
      {errors.global && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
          {errors.global}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-shopay-black mb-2">الاسم الكامل *</label>
        <input 
          type="text"
          value={formData.fullName}
          onChange={e => setFormData({...formData, fullName: e.target.value})}
          className={`w-full px-4 py-3 rounded-xl bg-shopay-gray-light/30 border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-shopay-gray-light focus:ring-shopay-purple'} focus:outline-none focus:ring-2 transition-all`}
          placeholder="محمد أحمد"
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-shopay-black mb-2">البريد الإلكتروني *</label>
        <input 
          type="email"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
          className={`w-full px-4 py-3 rounded-xl bg-shopay-gray-light/30 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-shopay-gray-light focus:ring-shopay-purple'} focus:outline-none focus:ring-2 transition-all`}
          placeholder="example@email.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-shopay-black mb-2">رقم الطلب (اختياري)</label>
        <input 
          type="text"
          value={formData.orderNumber}
          onChange={e => setFormData({...formData, orderNumber: e.target.value})}
          className="w-full px-4 py-3 rounded-xl bg-shopay-gray-light/30 border border-shopay-gray-light focus:ring-shopay-purple focus:outline-none focus:ring-2 transition-all"
          placeholder="مثال: 10234"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-shopay-black mb-2">نص الرسالة *</label>
        <textarea 
          rows={4}
          value={formData.message}
          onChange={e => setFormData({...formData, message: e.target.value})}
          className={`w-full px-4 py-3 rounded-xl bg-shopay-gray-light/30 border ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-shopay-gray-light focus:ring-shopay-purple'} focus:outline-none focus:ring-2 transition-all resize-none`}
          placeholder="اكتب رسالتك هنا بوضوح..."
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-4 rounded-xl font-bold text-white bg-shopay-purple hover:bg-shopay-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          "إرسال الرسالة"
        )}
      </button>
    </form>
  );
}
