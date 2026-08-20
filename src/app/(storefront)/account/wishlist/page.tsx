import { Heart } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-32 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-shopay-gray-light rounded-full flex items-center justify-center mb-6">
        <Heart className="w-12 h-12 text-shopay-black/30" />
      </div>
      <h2 className="text-3xl font-bold text-shopay-black mb-4">قائمة المفضلة فارغة</h2>
      <p className="text-shopay-black/60 mb-8 max-w-md">
        قائمة المفضلة الخاصة بك فارغة حالياً. هذه الميزة قيد التطوير وسيتم إطلاقها قريباً لتتمكن من حفظ منتجاتك المفضلة.
      </p>
      <Link 
        href="/" 
        className="bg-shopay-gradient text-shopay-white px-8 py-3 rounded-full font-bold shadow-md hover:opacity-90 transition-opacity"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
