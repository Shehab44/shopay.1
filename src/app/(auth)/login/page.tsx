"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-shopay-gray-light/30 px-4">
      <div className="bg-shopay-white p-8 rounded-2xl shadow-sm border border-shopay-gray-light w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-shopay-gray-light rounded-full flex items-center justify-center mx-auto mb-4 text-shopay-purple">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-shopay-black">تسجيل الدخول</h1>
          <p className="text-shopay-black/50 text-sm mt-2">أهلاً بك مجدداً في متجرنا</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div>
            <label className="block text-sm font-semibold text-shopay-black mb-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-shopay-gray-light focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 bg-shopay-gray-light/50"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-colors mt-2 ${loading ? 'bg-shopay-black/50 cursor-not-allowed' : 'bg-shopay-purple hover:bg-shopay-black'}`}
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-shopay-black/70 border-t pt-6 border-shopay-gray-light">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-bold text-shopay-purple hover:underline">
            سجل الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
