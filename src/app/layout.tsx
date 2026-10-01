import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SHOPAY | بوابتك للتسوق",
  description: "متجر شوباي لتجارة التجزئة والجملة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-shopay-black bg-shopay-white flex flex-col">
        <AuthProvider>
          {children}
          <Toaster dir="rtl" position="bottom-left" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
