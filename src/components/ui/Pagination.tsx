import Link from "next/link";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  createPageURL: (pageNumber: number | string) => string;
}

export default function Pagination({ totalPages, currentPage, createPageURL }: PaginationProps) {
  if (totalPages <= 1) return null;

  const generatePagination = () => {
    // If total pages is 7 or less, show all pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // If current page is among the first 3
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
    }

    // If current page is among the last 3
    if (currentPage >= totalPages - 2) {
      return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    // If current page is somewhere in the middle
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  };

  const allPages = generatePagination();

  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 mt-12" dir="ltr">
      {/* Prev Button (LTR means prev is left arrow, but since our layout is RTL, let's keep dir="rtl" or handle correctly) */}
      <div className="flex flex-row-reverse items-center justify-center gap-1 md:gap-2 w-full" dir="rtl">
        {/* Previous Button (Right Arrow in RTL) */}
        {currentPage <= 1 ? (
          <span className="w-10 h-10 flex items-center justify-center rounded-lg border border-shopay-gray-light text-shopay-black/30 cursor-not-allowed bg-transparent">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        ) : (
          <Link
            href={createPageURL(currentPage - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-shopay-gray-light hover:bg-shopay-gray-light text-shopay-black transition-colors bg-transparent"
            aria-label="الصفحة السابقة"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        )}

        {/* Page Numbers */}
        {allPages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-shopay-black/50">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-shopay-purple text-shopay-white pointer-events-none'
                  : 'bg-transparent text-shopay-black hover:bg-shopay-gray-light'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Link>
          );
        })}

        {/* Next Button (Left Arrow in RTL) */}
        {currentPage >= totalPages ? (
          <span className="w-10 h-10 flex items-center justify-center rounded-lg border border-shopay-gray-light text-shopay-black/30 cursor-not-allowed bg-transparent">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </span>
        ) : (
          <Link
            href={createPageURL(currentPage + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-shopay-gray-light hover:bg-shopay-gray-light text-shopay-black transition-colors bg-transparent"
            aria-label="الصفحة التالية"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
        )}
      </div>
    </div>
  );
}
