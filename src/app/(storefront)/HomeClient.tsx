"use client";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Zap, ShieldCheck } from "lucide-react";

export default function HomeClient({ 
  featuredProducts, 
  newProducts,
  categories
}: { 
  featuredProducts: any[], 
  newProducts: any[],
  categories: any[]
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col gap-16 pb-16 overflow-hidden">
      
      {/* Hero Banner */}
      <section className="bg-shopay-gradient text-shopay-white relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:flex-1 text-center md:text-right"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6 font-sans leading-tight">
              أهلاً بك في <span className="text-amber-400">SHOPAY</span>
            </h1>
            <p className="text-lg md:text-xl text-shopay-white/80 mb-8 max-w-lg leading-relaxed">
              وجهتك الأولى لشراء المنتجات بأفضل الأسعار بتجربة تسوق لا مثيل لها. جودة عالمية بين يديك.
            </p>
            <Link 
              href="/category/all" 
              className="inline-flex items-center gap-2 bg-amber-400 text-shopay-black font-bold py-4 px-10 rounded-full shadow-lg hover:bg-amber-500 transition-colors transform hover:-translate-y-1 hover:shadow-xl text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              تسوق الآن
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:flex-1 relative h-64 md:h-[450px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-shopay-purple/90 via-purple-900 to-shopay-black flex flex-col items-center justify-center p-6 text-center border border-shopay-white/20">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 mb-8 rounded-full bg-shopay-white/10 flex items-center justify-center backdrop-blur-md border border-shopay-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
              >
                <span className="text-7xl font-black text-amber-400 tracking-tighter">S</span>
              </motion.div>
              <h3 className="text-3xl font-black text-shopay-white mb-3">عروض حصرية</h3>
              <p className="text-shopay-white/80 text-lg">اكتشف أحدث التشكيلات بأفضل الأسعار</p>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-shopay-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-shopay-purple/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-shopay-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-shopay-gray-light p-6 md:p-8 flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <div className="bg-shopay-purple/10 p-4 rounded-full text-shopay-purple">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-shopay-black text-lg">دفع آمن</h4>
              <p className="text-shopay-black/60 text-sm">حماية 100% لمعلوماتك</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <div className="bg-amber-400/20 p-4 rounded-full text-amber-600">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-shopay-black text-lg">توصيل سريع</h4>
              <p className="text-shopay-black/60 text-sm">شحن لكافة المناطق</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <div className="bg-green-500/10 p-4 rounded-full text-green-600">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-shopay-black text-lg">جودة عالية</h4>
              <p className="text-shopay-black/60 text-sm">منتجات أصلية ومضمونة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-shopay-black">تسوق حسب القسم</h2>
          <Link href="/category/all" className="text-shopay-purple font-bold hover:underline">عرض الكل</Link>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link href={`/category/${cat.id}`} className="group block">
                <div className="bg-shopay-gray-light/50 border border-shopay-gray-light rounded-2xl p-6 text-center h-full hover:bg-shopay-purple hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="w-16 h-16 mx-auto bg-white text-shopay-purple group-hover:text-shopay-purple rounded-full flex items-center justify-center shadow-sm mb-4 transition-colors">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-sm leading-snug">{cat.nameAr}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 border-b border-shopay-gray-light pb-4">
          <h2 className="text-3xl font-black text-shopay-black flex items-center gap-3">
            <span className="w-2 h-8 bg-amber-400 rounded-full inline-block"></span>
            قد يعجبك
          </h2>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
        >
          {featuredProducts.map(product => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 border-b border-shopay-gray-light pb-4">
          <h2 className="text-3xl font-black text-shopay-black flex items-center gap-3">
            <span className="w-2 h-8 bg-shopay-purple rounded-full inline-block"></span>
            وصل حديثاً
          </h2>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
        >
          {newProducts.map(product => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}
