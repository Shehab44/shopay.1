"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon } from "lucide-react";

export default function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(category.imageUrl || "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      const updateRes = await fetch(`/api/v1/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (!updateRes.ok) throw new Error("فشل تحديث القسم");

      setImageUrl(url);
      toast.success("تم تحديث صورة القسم بنجاح");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
      <div className="font-bold text-lg">{category.nameAr}</div>
      <div className="relative aspect-[2/1] bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={category.nameAr} className="object-cover w-full h-full" />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-400" />
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      <div>
        <label className="bg-shopay-purple hover:bg-shopay-purple/90 text-white text-sm font-semibold py-2 px-4 rounded cursor-pointer text-center block transition-colors">
          تغيير الصورة
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
        </label>
      </div>
    </div>
  );
}
