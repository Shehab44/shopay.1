"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AccountSidebar({ user }: { user: { name?: string | null, phone?: string | null } }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "لوحة التحكم", href: "/account", icon: User },
    { name: "طلباتي", href: "/account/orders", icon: Package },
    { name: "المفضلة", href: "/account/wishlist", icon: Heart },
    { name: "إعدادات الحساب", href: "/account/settings", icon: Settings },
  ];

  return (
    <div className="w-full md:w-64 shrink-0">
      <div className="bg-shopay-white rounded-2xl border border-shopay-gray-light p-4 shadow-sm">
        <div className="flex items-center gap-4 p-4 border-b border-shopay-gray-light mb-2">
          <div className="w-12 h-12 bg-shopay-purple/10 text-shopay-purple rounded-full flex items-center justify-center font-bold text-xl shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : "ع"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-shopay-black truncate">{user.name || "العميل"}</div>
            <div className="text-xs text-shopay-black/50 truncate text-left" dir="ltr">{user.phone}</div>
          </div>
        </div>
        
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${
                  isActive 
                    ? "bg-shopay-purple/5 text-shopay-purple" 
                    : "text-shopay-black/70 hover:bg-shopay-gray-light hover:text-shopay-black"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          
          <div className="pt-2 mt-2 border-t border-shopay-gray-light">
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600/70 hover:bg-red-50 hover:text-red-600 transition-colors w-full font-bold"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
