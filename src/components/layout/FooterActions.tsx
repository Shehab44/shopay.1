"use client";
import { Share2, MessageCircle } from "lucide-react";

export default function FooterActions() {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: "SHOPAY",
        text: "تسوق أفضل المنتجات بأفضل الأسعار على SHOPAY",
        url: window.location.href,
      }).catch(console.error);
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = encodeURIComponent("مرحباً، لدي استفسار بخصوص متجر Shopay.");
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${message}` : null;

  return (
    <div className="flex gap-4">
      <a href="#" onClick={handleShare} className="w-10 h-10 rounded-full bg-shopay-white/10 flex items-center justify-center hover:bg-shopay-purple transition-colors" aria-label="مشاركة">
        <Share2 className="w-5 h-5" />
      </a>
      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-shopay-white/10 flex items-center justify-center hover:bg-shopay-purple transition-colors" aria-label="واتساب">
          <MessageCircle className="w-5 h-5" />
        </a>
      )}
    </div>
  );
}
