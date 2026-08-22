import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import { ArrowLeft } from "lucide-react";

export default async function Home() {
  // Fetch products
  const featuredProducts = await prisma.product.findMany({
    take: 8,
    include: { category: true },
    orderBy: { id: 'asc' }
  });

  const newProducts = await prisma.product.findMany({
    take: 8,
    include: { category: true },
    orderBy: { id: 'desc' }
  });

  // Wholesale section removed as per schema simplification
  const wholesaleProducts: any[] = [];

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* Hero Banner */}
      <section className="bg-shopay-gradient text-shopay-white relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans leading-tight">
              أهلاً بك في <span className="text-shopay-white/90">SHOPAY</span>
            </h1>
            <p className="text-lg md:text-xl text-shopay-white/80 mb-8 max-w-lg">
              وجهتك الأولى لشراء المنتجات بأفضل الأسعار. مفرق وجملة بتجربة تسوق لا مثيل لها.
            </p>
            <Link 
              href="/category/0103" 
              className="inline-block bg-shopay-white text-shopay-purple font-bold py-3 px-8 rounded-full shadow-lg hover:bg-shopay-gray-light transition-colors transform hover:-translate-y-1"
            >
              تسوق الآن
            </Link>
          </div>
          <div className="md:w-1/2 relative h-64 md:h-96 w-full">
            {/* Placeholder for banner image */}
            <div className="absolute inset-0 bg-shopay-white/10 rounded-2xl border border-shopay-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-shopay-white/50 text-2xl font-bold">صورة عروض المتجر</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-shopay-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-shopay-black/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-shopay-black">الأكثر مبيعاً</h2>
          <Link href="/search" className="text-shopay-purple font-medium flex items-center gap-1 hover:underline">
            عرض الكل <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* Wholesale Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-shopay-gray-light rounded-2xl p-8 md:p-12 border border-shopay-black/5 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-shopay-black mb-2">أسعار الجملة متوفرة للجميع!</h2>
            <p className="text-shopay-black/60 max-w-xl">
              تصفح المنتجات التي توفر خيارات التعبئة الكبيرة (علبة، صندوق) واستفد من خصومات حصرية.
            </p>
          </div>
          <Link 
            href="/wholesale" 
            className="shrink-0 bg-shopay-gradient text-shopay-white font-bold py-3 px-8 rounded-full shadow-md hover:opacity-90 transition-opacity"
          >
            تصفح عروض الجملة
          </Link>
        </div>
      </section>

      {/* Wholesale Products */}
      {wholesaleProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-shopay-black">تشكيلة الجملة</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wholesaleProducts.map(product => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-shopay-black">وصل حديثاً</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

    </div>
  );
}
