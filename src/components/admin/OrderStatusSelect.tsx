"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderStatusSelect({ 
  orderId, 
  initialStatus 
}: { 
  orderId: number, 
  initialStatus: string 
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        setStatus(initialStatus); // revert on error
        alert("فشل تحديث حالة الطلب");
      }
    } catch {
      setStatus(initialStatus);
      alert("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    if (s === 'pending') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s === 'completed') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <select 
      value={status}
      onChange={handleChange}
      disabled={loading}
      className={`text-xs font-bold rounded px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-shopay-purple/50 transition-colors ${getStatusColor(status)} ${loading ? 'opacity-50' : ''}`}
    >
      <option value="pending" className="bg-white text-black">قيد الانتظار</option>
      <option value="completed" className="bg-white text-black">مكتمل</option>
      <option value="cancelled" className="bg-white text-black">ملغي</option>
    </select>
  );
}
