"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle, Loader2 } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { toast } from "sonner";

export default function ProductImageUpload({ 
  productId, 
  matCode, 
  currentImageUrl 
}: { 
  productId: number, 
  matCode: string, 
  currentImageUrl: string | null 
}) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/v1/admin/products/${productId}/image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setImageUrl(data.imageUrl);
        toast.success('تم رفع الصورة بنجاح');
      } else {
        toast.error(data.error || 'فشل رفع الصورة');
      }
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded border border-shopay-black/10 overflow-hidden relative shrink-0 bg-shopay-gray-light flex items-center justify-center">
        {loading ? (
          <Loader2 className="w-5 h-5 text-shopay-purple animate-spin" />
        ) : (
          <ProductImage 
            matCode={matCode} 
            databaseImageUrl={imageUrl} 
            alt="صورة المنتج" 
            fill 
            className="object-cover" 
          />
        )}
      </div>
      
      <div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="text-xs bg-shopay-black text-shopay-white px-3 py-1.5 rounded font-bold hover:bg-shopay-purple transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <UploadCloud className="w-3 h-3" />
          رفع صورة
        </button>
      </div>
    </div>
  );
}
