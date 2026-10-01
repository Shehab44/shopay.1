"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("الاسم مطلوب");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/account/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ أثناء الحفظ");

      setSuccessMsg("تم حفظ التغييرات بنجاح!");
      // Update NextAuth session
      await update({ name });
      router.refresh();
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light shadow-sm overflow-hidden min-h-[500px]">
      <div className="p-6 border-b border-shopay-gray-light">
        <h2 className="text-xl font-bold text-shopay-black">إعدادات الحساب</h2>
      </div>
      
      <div className="p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-shopay-black mb-2">رقم الهاتف (غير قابل للتعديل)</label>
            <input 
              type="text" 
              value={(session?.user as any)?.phone || ""}
              disabled
              dir="ltr"
              className="w-full px-4 py-3 bg-shopay-gray-light text-shopay-black/50 rounded-lg cursor-not-allowed border border-transparent"
            />
            <p className="text-xs text-shopay-black/50 mt-1">رقم الهاتف مرتبط بهويتك الأساسية ولا يمكن تغييره.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-shopay-black mb-2">الاسم الكامل</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="w-full px-4 py-3 bg-white border border-shopay-gray-light text-shopay-black rounded-lg focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 focus:border-shopay-purple transition-all"
            />
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {successMsg}
            </div>
          )}

          <div className="pt-4 border-t border-shopay-gray-light">
            <button 
              type="submit" 
              disabled={isLoading || name === session?.user?.name}
              className="px-8 py-3 bg-shopay-purple text-white rounded-lg font-bold hover:bg-shopay-purple/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
