import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن | SHOPAY",
  description: "تعرف على قصة متجر SHOPAY ورؤيتنا في تقديم أفضل المنتجات.",
};

export default function AboutPage() {
  return (
    <div className="bg-shopay-white min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold text-shopay-black mb-8 text-center">
          من <span className="text-shopay-purple">نحن</span>
        </h1>
        
        <div className="prose prose-lg prose-purple max-w-none text-shopay-black/80 space-y-6 text-center">
          <p className="text-xl font-medium leading-relaxed">
            مرحباً بكم في <strong>SHOPAY</strong>، الوجهة الإلكترونية الرائدة للتسوق في المنطقة.
          </p>

          <p className="leading-relaxed">
            تأسس متجر SHOPAY برؤية طموحة تهدف إلى إحداث ثورة في عالم التجارة الإلكترونية، من خلال تقديم تشكيلة واسعة من المنتجات عالية الجودة التي تلبي كافة احتياجات العائلة العصرية. نحن لا نبيع مجرد منتجات، بل نقدم "تجربة تسوق" متكاملة تجمع بين السهولة، السرعة، والموثوقية.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-12">
            <div className="bg-shopay-gray-light p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-shopay-purple mb-3">رؤيتنا</h3>
              <p className="text-sm">أن نكون الخيار الأول والمنصة الأكثر موثوقية للتسوق الإلكتروني في الشرق الأوسط، مع التركيز على رضا العميل المطلق.</p>
            </div>
            <div className="bg-shopay-gray-light p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-shopay-purple mb-3">مهمتنا</h3>
              <p className="text-sm">توفير منتجات أصلية ومتنوعة بأسعار تنافسية، مع ضمان تجربة مستخدم سلسة وخدمة توصيل سريعة وآمنة.</p>
            </div>
            <div className="bg-shopay-gray-light p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-shopay-purple mb-3">قيمنا</h3>
              <p className="text-sm">الشفافية، الجودة، الابتكار، والالتزام بتقديم خدمة عملاء استثنائية تتجاوز التوقعات.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-shopay-black mt-8">لماذا تختار SHOPAY؟</h2>
          <ul className="text-right list-disc list-inside space-y-2 mr-4 max-w-2xl mx-auto">
            <li>مجموعة واسعة من المنتجات المختارة بعناية.</li>
            <li>أسعار تنافسية وعروض حصرية مستمرة.</li>
            <li>واجهة مستخدم سهلة وبسيطة تناسب الجميع.</li>
            <li>طرق دفع آمنة ومتعددة.</li>
            <li>فريق دعم فني متواجد لخدمتك على مدار الساعة.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
