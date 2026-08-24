import Accordion from "@/components/faq/Accordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | SHOPAY",
  description: "إجابات على الأسئلة الشائعة حول الطلبات، الشحن، الإرجاع، وطرق الدفع في متجر SHOPAY.",
};

const faqData = [
  {
    category: "الطلبات والشحن 📦",
    items: [
      {
        q: "كم يستغرق شحن الطلب للوصول إلي؟",
        a: "عادةً ما نقوم بتجهيز وشحن الطلبات خلال 24 ساعة. التوصيل داخل المدن الرئيسية يستغرق من 1 إلى 3 أيام عمل، بينما قد يستغرق التوصيل للمناطق النائية من 3 إلى 5 أيام عمل."
      },
      {
        q: "كيف يمكنني تتبع طلبي؟",
        a: "بمجرد شحن طلبك، سنرسل لك رسالة نصية وبريداً إلكترونياً يحتوي على رقم التتبع ورابط لشركة الشحن، حيث يمكنك متابعة حالة طلبك خطوة بخطوة."
      }
    ]
  },
  {
    category: "سياسة الإرجاع 🔄",
    items: [
      {
        q: "هل يمكنني استرجاع المنتج إذا لم يعجبني؟",
        a: "نعم، نحن نقدم سياسة إرجاع مرنة خلال 14 يوماً من تاريخ الاستلام، بشرط أن يكون المنتج بحالته الأصلية، غير مستخدم، وبغلافه الأصلي."
      },
      {
        q: "كيف أسترد أموالي بعد الإرجاع؟",
        a: "بعد استلامنا للمنتج المرتجع وفحصه، يتم تحويل المبلغ إلى نفس وسيلة الدفع الأصلية خلال 3 إلى 7 أيام عمل، أو كرصيد في محفظتك بالمتجر (حسب رغبتك)."
      }
    ]
  },
  {
    category: "الدفع 💳",
    items: [
      {
        q: "ما هي طرق الدفع المتاحة في المتجر؟",
        a: "نحن نقبل الدفع عبر البطاقات الائتمانية (فيزا، ماستركارد)، مدى، Apple Pay، بالإضافة إلى خدمة الدفع عند الاستلام لمناطق محددة."
      },
      {
        q: "هل بياناتي البنكية آمنة؟",
        a: "بالتأكيد، جميع المعاملات المالية مشفرة بالكامل عبر بروتوكولات حماية عالية (SSL)، ولا نقوم بتخزين أرقام بطاقتك الائتمانية في خوادمنا أبداً."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="bg-shopay-white min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-shopay-black mb-4">
            الأسئلة <span className="text-shopay-gradient">الشائعة</span>
          </h1>
          <p className="text-shopay-black/70 text-lg max-w-2xl mx-auto">
            جمعنا لك إجابات وافية على الأسئلة الأكثر شيوعاً لتسهيل تجربتك في التسوق.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqData.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-2xl font-bold text-shopay-black mb-6 flex items-center border-b border-shopay-gray-light pb-4">
                {section.category}
              </h2>
              <div>
                {section.items.map((item, itemIdx) => (
                  <Accordion 
                    key={itemIdx} 
                    question={item.q} 
                    answer={item.a} 
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Support Prompt */}
        <div className="mt-16 bg-shopay-gray-light/10 border border-shopay-gray-light rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-shopay-black mb-3">لم تجد إجابة لسؤالك؟</h3>
          <p className="text-shopay-black/70 mb-6">فريق خدمة العملاء متواجد دائماً للرد على استفساراتك.</p>
          <a 
            href="/contact" 
            className="inline-block bg-shopay-purple hover:bg-shopay-black text-white px-8 py-3 rounded-xl font-bold transition-colors duration-300 shadow-sm hover:shadow-md"
          >
            تواصل معنا
          </a>
        </div>

      </div>
    </div>
  );
}
