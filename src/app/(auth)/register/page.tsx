"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_otp", phone }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "فشل إرسال الكود");
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "verify_otp", 
          phone, 
          fullName, 
          password, 
          otpCode 
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "فشل التحقق");
      
      // Success, redirect to login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-shopay-gray-light/30 px-4">
      <div className="bg-shopay-white p-8 rounded-2xl shadow-sm border border-shopay-gray-light w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-shopay-gray-light rounded-full flex items-center justify-center mx-auto mb-4 text-shopay-purple">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-shopay-black">حساب جديد</h1>
          <p className="text-shopay-black/50 text-sm mt-2">
            {step === 1 ? "أدخل رقم هاتفك لنرسل لك كود التحقق" : "أدخل بياناتك وكود التحقق"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded font-semibold text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-shopay-black mb-1">رقم الهاتف</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-lg border border-shopay-gray-light focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 bg-shopay-gray-light/50"
                placeholder="09xxxxxxxx"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors mt-2 ${loading ? 'bg-shopay-black/50 cursor-not-allowed' : 'bg-shopay-purple hover:bg-shopay-black'}`}
            >
              {loading ? "جاري الإرسال..." : "إرسال كود التحقق"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
             <div>
              <label className="block text-sm font-semibold text-shopay-black mb-1">رمز التحقق (OTP)</label>
              <input 
                type="text" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full p-3 text-center tracking-widest font-mono text-xl rounded-lg border border-shopay-gray-light focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 bg-shopay-purple/5"
                placeholder="0000"
                required
              />
              <div className="text-xs text-shopay-black/50 mt-1 text-center">
                (للتجربة حالياً: الكود مطبوع في موجه الأوامر Terminal)
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-shopay-black mb-1">الاسم الكامل</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-lg border border-shopay-gray-light focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 bg-shopay-gray-light/50"
                placeholder="الاسم الكامل"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-shopay-black mb-1">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-shopay-gray-light focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 bg-shopay-gray-light/50"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors mt-2 ${loading ? 'bg-shopay-black/50 cursor-not-allowed' : 'bg-shopay-purple hover:bg-shopay-black'}`}
            >
              {loading ? "جاري التسجيل..." : "تأكيد وإنشاء الحساب"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-shopay-black/70 border-t pt-6 border-shopay-gray-light">
          لديك حساب مسبقاً؟{" "}
          <Link href="/login" className="font-bold text-shopay-purple hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
