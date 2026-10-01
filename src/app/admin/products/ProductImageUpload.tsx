"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
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
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>(currentImageUrl ? [currentImageUrl] : []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Client-Side Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم إحدى الصور يتجاوز الحد المسموح 5MB');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error('صيغة أحد الملفات غير مدعومة');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    setLoading(true);
    
    try {
      const newUrls: string[] = [];
      // Upload files sequentially to prevent overwhelming the server
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch(`/api/v1/admin/products/${productId}/image`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        if (res.ok) {
          newUrls.push(data.imageUrl);
        } else {
          toast.error(data.error || 'فشل رفع إحدى الصور');
        }
      }
      
      if (newUrls.length > 0) {
        setUploadedImages(prev => [...prev, ...newUrls]);
        toast.success(`تم رفع ${newUrls.length} صورة بنجاح`);
      }
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة نهائياً؟')) return;
    
    setDeletingUrl(url);
    try {
      const res = await fetch(`/api/v1/admin/products/${productId}/image`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: url }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUploadedImages(prev => prev.filter(img => img !== url));
        toast.success('تم حذف الصورة بنجاح');
      } else {
        toast.error(data.error || 'فشل حذف الصورة');
      }
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'خطأ في الاتصال بالخادم');
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {uploadedImages.length > 0 ? (
          uploadedImages.map((url, idx) => (
            <div key={idx} className="w-20 h-20 rounded border border-shopay-black/10 overflow-hidden relative shrink-0 bg-shopay-gray-light flex items-center justify-center group">
              <ProductImage 
                matCode={matCode} 
                databaseImageUrl={url} 
                alt={`صورة المنتج ${idx + 1}`} 
                fill 
                className={`object-cover ${deletingUrl === url ? 'opacity-50' : ''}`} 
              />
              
              {/* Delete Button */}
              {deletingUrl === url ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              ) : (
                <button
                  onClick={() => handleDelete(url)}
                  disabled={deletingUrl !== null || loading}
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="حذف الصورة"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="w-20 h-20 rounded border border-shopay-black/10 overflow-hidden relative shrink-0 bg-shopay-gray-light flex items-center justify-center text-xs text-shopay-black/50 text-center px-2">
            لا توجد صور
          </div>
        )}
        
        {loading && (
          <div className="w-20 h-20 rounded border border-shopay-black/10 overflow-hidden relative shrink-0 bg-shopay-gray-light flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-shopay-purple animate-spin" />
          </div>
        )}
      </div>
      
      <div>
        <input 
          type="file" 
          multiple
          accept="image/jpeg, image/png, image/webp" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || deletingUrl !== null}
          className="text-sm bg-shopay-black text-shopay-white px-4 py-2 rounded font-bold hover:bg-shopay-purple transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          رفع صور متعددة
        </button>
      </div>
    </div>
  );
}
