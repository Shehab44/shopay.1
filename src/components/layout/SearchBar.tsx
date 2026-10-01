"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Suggestion {
  id: number;
  nameAr: string;
  matCode: string;
  price: number;
  mainImageUrl: string | null;
}

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.products || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/search`);
    }
  };

  const handleSuggestionClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative">
        <input 
          id="search-input"
          name="q"
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim() && suggestions.length > 0) setIsOpen(true) }}
          placeholder="ابحث عن منتج أو رمز..." 
          aria-label="ابحث عن المنتجات"
          className="w-full bg-shopay-gray-light text-shopay-black px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-shopay-purple/50"
        />
        <button type="submit" aria-label="تنفيذ البحث" className="absolute right-3 top-2.5 text-shopay-black/50 hover:text-shopay-purple">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </form>

      {/* Auto-complete Dropdown */}
      {isOpen && (query.trim().length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-shopay-gray-light overflow-hidden z-50">
          {suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((product) => (
                <li key={product.id}>
                  <Link 
                    href={`/product/${product.id}`}
                    onClick={handleSuggestionClick}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-shopay-gray-light transition-colors"
                  >
                    {product.mainImageUrl ? (
                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-shopay-gray-light">
                        <Image src={product.mainImageUrl} alt={product.nameAr} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded flex-shrink-0 bg-shopay-gray-light flex items-center justify-center">
                        <Search className="w-4 h-4 text-shopay-black/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-shopay-black truncate">{product.nameAr}</p>
                      <p className="text-xs text-shopay-black/50">{product.matCode}</p>
                    </div>
                    <div className="text-sm font-bold text-shopay-purple">
                      {product.price} ر.س
                    </div>
                  </Link>
                </li>
              ))}
              <li className="border-t border-shopay-gray-light mt-2">
                <button 
                  onClick={handleSearch}
                  className="w-full text-center px-4 py-3 text-sm text-shopay-purple hover:bg-shopay-gray-light font-medium transition-colors"
                >
                  عرض جميع نتائج "{query}"
                </button>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-shopay-black/50">
              لا توجد نتائج مطابقة لبحثك
            </div>
          )}
        </div>
      )}
    </div>
  );
}
