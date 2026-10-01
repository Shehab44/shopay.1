import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | SHOPAY",
  description: "سياسة الخصوصية وحماية بيانات المستخدمين في متجر SHOPAY.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-shopay-white min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold text-shopay-black mb-8 text-center">
          سياسة <span className="text-shopay-purple">الخصوصية</span>
        </h1>
        
        <div className="prose prose-lg prose-purple max-w-none text-shopay-black/80 space-y-6">
          <p>
            في <strong>SHOPAY</strong>، نلتزم بحماية خصوصيتك وضمان سرية بياناتك الشخصية. توضح هذه السياسة كيف نقوم بجمع، استخدام، وحماية معلوماتك عند استخدامك لموقعنا أو خدماتنا.
          </p>

          <h2 className="text-2xl font-bold text-shopay-black border-b border-shopay-gray-light pb-2 mt-8">1. المعلومات التي نجمعها</h2>
          <p>قد نقوم بجمع المعلومات التالية عند تسجيلك أو قيامك بعملية شراء:</p>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li>الاسم الكامل ومعلومات الاتصال (مثل رقم الهاتف والبريد الإلكتروني).</li>
            <li>عنوان الشحن والتوصيل.</li>
            <li>معلومات الدفع (يتم معالجتها عبر بوابات دفع آمنة ولا يتم تخزين تفاصيل البطاقة على خوادمنا).</li>
            <li>سجل الطلبات وتفضيلات التسوق.</li>
          </ul>

          <h2 className="text-2xl font-bold text-shopay-black border-b border-shopay-gray-light pb-2 mt-8">2. كيف نستخدم معلوماتك؟</h2>
          <p>نستخدم بياناتك الشخصية للأغراض التالية:</p>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li>معالجة طلباتك وتوصيل المنتجات إليك.</li>
            <li>التواصل معك بخصوص حالة الطلب أو للإجابة على استفساراتك.</li>
            <li>تحسين تجربة المستخدم وتخصيص الموقع بما يتناسب مع اهتماماتك.</li>
            <li>إرسال العروض الترويجية والتحديثات (يمكنك إلغاء الاشتراك في أي وقت).</li>
          </ul>

          <h2 className="text-2xl font-bold text-shopay-black border-b border-shopay-gray-light pb-2 mt-8">3. حماية البيانات</h2>
          <p>
            نحن نستخدم تقنيات التشفير المتقدمة (SSL) لحماية بياناتك الشخصية والمالية أثناء النقل. كما نتخذ إجراءات أمنية صارمة لمنع الوصول غير المصرح به أو فقدان البيانات.
          </p>

          <h2 className="text-2xl font-bold text-shopay-black border-b border-shopay-gray-light pb-2 mt-8">4. مشاركة المعلومات مع أطراف ثالثة</h2>
          <p>
            نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي جهة. قد نشارك بعض البيانات مع شركاء موثوقين فقط لغرض إتمام الخدمة (مثل شركات الشحن والتوصيل، أو بوابات الدفع الإلكتروني) تحت اتفاقيات سرية صارمة.
          </p>

          <h2 className="text-2xl font-bold text-shopay-black border-b border-shopay-gray-light pb-2 mt-8">5. حقوقك</h2>
          <p>
            يحق لك في أي وقت طلب الوصول إلى بياناتك الشخصية، أو تصحيحها، أو حذفها من أنظمتنا. يمكنك التواصل معنا عبر صفحة "اتصل بنا" لممارسة هذه الحقوق.
          </p>
        </div>
      </div>
    </div>
  );
}
