import { Phone, Mail, Clock, MessageCircle } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اتصل بنا | SHOPAY",
  description: "تواصل مع فريق خدمة العملاء في متجر SHOPAY لأي استفسار أو طلب مساعدة.",
};

export default function ContactPage() {
  return (
    <div className="bg-shopay-gray-light/10 min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-shopay-black mb-4">
            يسعدنا <span className="text-shopay-gradient">تواصلك</span> معنا
          </h1>
          <p className="text-shopay-black/70 max-w-2xl mx-auto text-lg">
            فريقنا متاح دائماً للإجابة على استفساراتك، ومساعدتك في تتبع طلباتك، وضمان حصولك على أفضل تجربة تسوق ممكنة.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start">
          
          {/* Info Cards Side */}
          <div className="space-y-6">
            <div className="bg-shopay-white p-6 rounded-2xl shadow-sm border border-shopay-gray-light flex items-start gap-4 group hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-full bg-shopay-purple/10 text-shopay-purple flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-shopay-black mb-1">رقم الهاتف</h3>
                <p className="text-shopay-black/70" dir="ltr">+961 00 000 000</p>
              </div>
            </div>

            <div className="bg-shopay-white p-6 rounded-2xl shadow-sm border border-shopay-gray-light flex items-start gap-4 group hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-full bg-shopay-purple/10 text-shopay-purple flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-shopay-black mb-1">البريد الإلكتروني</h3>
                <p className="text-shopay-black/70">support@shopay.com</p>
              </div>
            </div>

            <div className="bg-shopay-white p-6 rounded-2xl shadow-sm border border-shopay-gray-light flex items-start gap-4 group hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-full bg-shopay-purple/10 text-shopay-purple flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-shopay-black mb-1">ساعات العمل</h3>
                <p className="text-shopay-black/70">الإثنين - الجمعة: 9:00 صباحاً - 6:00 مساءً</p>
                <p className="text-shopay-black/50 text-sm mt-1">السبت والأحد: عطلة مغلق</p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a 
              href="https://wa.me/96100000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 px-6 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all duration-300 shadow-sm"
            >
              <MessageCircle className="w-6 h-6" />
              تحدث معنا عبر واتساب الآن
            </a>
          </div>

          {/* Contact Form Side */}
          <div className="lg:pr-8">
            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  );
}
