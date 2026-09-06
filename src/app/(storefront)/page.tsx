/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import prisma from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";

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

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* Hero Banner */}
      <section className="bg-shopay-gradient text-shopay-white relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:flex-1 text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans leading-tight">
              أهلاً بك في <span className="text-shopay-white/90">SHOPAY</span>
            </h1>
            <p className="text-lg md:text-xl text-shopay-white/80 mb-8 max-w-lg">
              وجهتك الأولى لشراء المنتجات بأفضل الأسعار بتجربة تسوق لا مثيل لها.
            </p>
            <Link 
              href="/category/103" 
              className="inline-block bg-shopay-white text-shopay-purple font-bold py-3 px-8 rounded-full shadow-lg hover:bg-shopay-gray-light transition-colors transform hover:-translate-y-1"
            >
              تسوق الآن
            </Link>
          </div>
          <div className="w-full md:flex-1 relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
            {/* Elegant Gradient Banner Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-shopay-purple via-purple-900 to-shopay-black flex flex-col items-center justify-center p-6 text-center border border-shopay-white/10">
              <div className="w-24 h-24 mb-6 rounded-full bg-shopay-white/10 flex items-center justify-center backdrop-blur-md">
                <span className="text-5xl font-black text-shopay-white tracking-tighter">S</span>
              </div>
              <h3 className="text-2xl font-bold text-shopay-white mb-2">عروض حصرية</h3>
              <p className="text-shopay-white/70">اكتشف أحدث التشكيلات بأفضل الأسعار</p>
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
          <h2 className="text-2xl font-bold text-shopay-black">قد يعجبك</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

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
