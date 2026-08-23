"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/search`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن منتج أو رمز..." 
        className="w-full bg-shopay-gray-light text-shopay-black px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-shopay-purple/50"
      />
      <button type="submit" className="absolute right-3 top-2.5 text-shopay-black/50 hover:text-shopay-purple">
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
}
