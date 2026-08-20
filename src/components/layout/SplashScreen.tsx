"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      const timer = setTimeout(() => {
        handleSkip();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSkip = () => {
    setShowSplash(false);
    sessionStorage.setItem("hasSeenSplash", "true");
  };

  if (!isMounted) return null;

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-shopay-white"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            dir="rtl"
          >
            {/* Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleSkip}
              className="absolute top-6 left-6 text-shopay-white bg-shopay-black/50 px-4 py-1 rounded-full text-sm z-50 hover:bg-shopay-black/70 cursor-pointer"
            >
              تخطي
            </motion.button>

            <div className="relative flex flex-col items-center">
              {/* Logo Animation */}
              <div className="relative w-32 h-32 mb-6 overflow-hidden flex items-center justify-center">
                {/* Speed Lines */}
                <motion.div
                  className="absolute inset-0 flex flex-col justify-center space-y-3"
                  initial={{ x: "100%" }}
                  animate={{ x: "-100%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <div className="h-1 bg-shopay-purple w-full"></div>
                  <div className="h-1 bg-shopay-purple w-2/3 mr-auto"></div>
                  <div className="h-1 bg-shopay-purple w-full"></div>
                </motion.div>

                {/* 'S' Logo Morph */}
                <motion.svg
                  viewBox="0 0 100 100"
                  className="absolute w-24 h-24 drop-shadow-lg"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
                >
                  <defs>
                    <linearGradient id="s-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--shopay-black)" />
                      <stop offset="100%" stopColor="var(--shopay-purple)" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 70,30 C 70,10 30,10 30,30 C 30,50 70,50 70,70 C 70,90 30,90 30,70"
                    fill="none"
                    stroke="url(#s-grad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </motion.svg>
              </div>

              {/* Text SHOPAY */}
              <motion.div
                className="flex space-x-1 space-x-reverse"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { delayChildren: 1.5, staggerChildren: 0.1 },
                  },
                }}
              >
                {["S", "H", "O", "P", "A", "Y"].map((letter, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="text-5xl font-bold text-shopay-gradient tracking-wider font-sans"
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.5 }}
                className="mt-4 text-shopay-black/80 font-bold tracking-wide text-lg"
              >
                بوابتك للتسوق
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && children}
    </>
  );
}
