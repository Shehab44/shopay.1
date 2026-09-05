'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProduct } from '../../actions';
import { Loader2 } from 'lucide-react';

export default function EditProductClient({ product }: { product: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: product.nameAr,
    price: product.price,
    isActive: product.isActive
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProduct(product.id, formData);
      alert('تم تحديث المنتج بنجاح');
      router.push('/admin/products');
    } catch (err) {
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-semibold text-shopay-black mb-2">اسم المنتج (عربي)</label>
        <input 
          type="text" 
          value={formData.nameAr}
          onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
          className="w-full bg-shopay-gray-light text-shopay-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopay-purple/50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-shopay-black mb-2">السعر</label>
        <input 
          type="number" 
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
          className="w-full bg-shopay-gray-light text-shopay-black px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopay-purple/50"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={formData.isActive}
          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
          className="rounded text-shopay-purple focus:ring-shopay-purple"
        />
        <label className="text-sm font-semibold text-shopay-black">منتج نشط (يظهر في المتجر)</label>
      </div>

      <div className="flex gap-4 pt-4 border-t border-shopay-gray-light">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-shopay-purple text-shopay-white px-6 py-2 rounded-lg font-bold hover:bg-shopay-black transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          حفظ التغييرات
        </button>
        <button 
          type="button" 
          onClick={() => router.push('/admin/products')}
          className="bg-shopay-gray-light text-shopay-black px-6 py-2 rounded-lg font-bold hover:bg-black/5 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
