"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Loader2 } from "lucide-react";
import { getMoreSearchResults } from "@/app/actions/searchActions";

interface InfiniteProductGridProps {
  initialProducts: any[];
  totalCount: number;
  limit: number;
  searchParams: {
    q: string;
    categoryFilter?: number;
    minPrice?: number;
    maxPrice?: number;
    sort: string;
  };
}

export default function InfiniteProductGrid({
  initialProducts,
  totalCount,
  limit,
  searchParams,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset state if searchParams change
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialProducts.length < totalCount);
  }, [initialProducts, totalCount, searchParams]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const newProducts = await getMoreSearchResults({
        ...searchParams,
        page: nextPage,
        limit
      });
      
      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
        if (products.length + newProducts.length >= totalCount) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch more products", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, searchParams, limit, products.length, totalCount]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    observerRef.current = observer;

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loadMore]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={`${product.id}-${Math.random()}`} product={product} />
        ))}
      </div>
      
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 flex justify-center items-center w-full">
          {loading && (
            <div className="flex flex-col items-center text-shopay-black/50 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-shopay-purple" />
              <span className="text-sm font-medium">جاري تحميل المزيد...</span>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && products.length > 0 && (
        <div className="py-12 text-center text-shopay-black/40 text-sm font-medium">
          تم عرض جميع النتائج
        </div>
      )}
    </>
  );
}
