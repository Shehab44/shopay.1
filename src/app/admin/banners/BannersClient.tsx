"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash, Plus } from "lucide-react";

export default function BannersClient({ initialBanners }: { initialBanners: any[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("فشل رفع الصورة");
      const { url } = await uploadRes.json();
      
      const res = await fetch("/api/v1/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, linkUrl: null }),
      });

      if (!res.ok) throw new Error("فشل حفظ البانر");

      const { banner } = await res.json();
      setBanners([banner, ...banners]);
      toast.success("تم إضافة البانر بنجاح");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا البانر؟")) return;
    try {
      const res = await fetch(`/api/v1/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      setBanners(banners.filter(b => b.id !== id));
      toast.success("تم الحذف بنجاح");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      
      <div className="mb-8">
        <label className="inline-flex items-center gap-2 bg-shopay-purple hover:bg-shopay-purple/90 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors shadow-sm">
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          إضافة بانر جديد
          <input type="file" className="hidden" accept="image/*" onChange={handleAddBanner} disabled={isUploading} />
        </label>
        <p className="text-sm text-gray-500 mt-2">يفضل استخدام صور عريضة الأبعاد للحفاظ على دقة التصميم في الرئيسية.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl} alt="Banner" className="w-full h-auto aspect-[3/1] object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => handleDelete(banner.id)}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            لا توجد بانرات مضافة حالياً.
          </div>
        )}
      </div>
    </div>
  );
}
