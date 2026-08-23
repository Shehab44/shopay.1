"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/v1/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-shopay-gray-light p-4">
      <div className="bg-shopay-white p-8 rounded-2xl shadow-md w-full max-w-md border border-shopay-gray-light">
        <div className="w-16 h-16 bg-shopay-purple/10 text-shopay-purple rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 text-shopay-black">لوحة التحكم</h1>
        <p className="text-center text-shopay-black/50 mb-8 text-sm">أدخل كلمة المرور للمتابعة</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-shopay-black">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-left rounded-lg bg-shopay-gray-light border-none focus:outline-none focus:ring-2 focus:ring-shopay-purple"
              placeholder="••••••••"
              dir="ltr"
              required
            />
          </div>
          
          {error && <div className="text-red-500 text-sm font-semibold bg-red-50 p-3 rounded">{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 bg-shopay-black text-shopay-white font-bold py-3 rounded-lg hover:bg-shopay-purple transition-colors disabled:opacity-50"
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
