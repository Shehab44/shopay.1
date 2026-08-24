import Link from 'next/link';
import { Phone, Mail, MapPin, Share2, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-shopay-black text-shopay-white pt-12 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-shopay-gradient bg-shopay-white px-2 rounded font-sans" dir="ltr">SHOPAY</span>
            </div>
            <p className="text-shopay-gray-light/80 text-sm leading-relaxed mb-6">
              بوابتك للتسوق الموثوق. خيارك الأول لشراء المنتجات بأسعار المفرق والجملة بأفضل جودة وأسرع توصيل.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-shopay-white/10 flex items-center justify-center hover:bg-shopay-purple transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-shopay-white/10 flex items-center justify-center hover:bg-shopay-purple transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-shopay-white/10 pb-2">روابط سريعة</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-shopay-gray-light/80 hover:text-shopay-white text-sm transition-colors">من نحن</Link></li>
              <li><Link href="/faq" className="text-shopay-gray-light/80 hover:text-shopay-white text-sm transition-colors">الأسئلة الشائعة</Link></li>

              <li><Link href="/contact" className="text-shopay-gray-light/80 hover:text-shopay-white text-sm transition-colors">اتصل بنا</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-shopay-white/10 pb-2">خدمة العملاء</h3>
            <ul className="space-y-3">
              <li><Link href="/account" className="text-shopay-gray-light/80 hover:text-shopay-white text-sm transition-colors">حسابي</Link></li>
              <li><Link href="/account/orders" className="text-shopay-gray-light/80 hover:text-shopay-white text-sm transition-colors">تتبع الطلب</Link></li>
              <li><Link href="/return-policy" className="text-shopay-gray-light/80 hover:text-shopay-white text-sm transition-colors">سياسة الإرجاع</Link></li>
              <li><Link href="/terms" className="text-shopay-gray-light/80 hover:text-shopay-white text-sm transition-colors">الشروط والأحكام</Link></li>
              <li><Link href="/privacy-policy" className="text-shopay-gray-light/80 hover:text-shopay-white text-sm transition-colors">سياسة الخصوصية</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-shopay-white/10 pb-2">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-shopay-purple shrink-0 mt-0.5" />
                <span className="text-shopay-gray-light/80 text-sm">لبنان - المقر الرئيسي</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-shopay-purple shrink-0" />
                <span className="text-shopay-gray-light/80 text-sm" dir="ltr">+961 XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-shopay-purple shrink-0" />
                <span className="text-shopay-gray-light/80 text-sm">support@shopay.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-shopay-white/10 pt-6 text-center">
          <p className="text-shopay-gray-light/60 text-sm">
            &copy; {new Date().getFullYear()} SHOPAY. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
