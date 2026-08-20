import Link from 'next/link';
import prisma from '@/lib/db';

export default async function Navbar() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' }
  });

  return (
    <nav className="w-full bg-shopay-white border-b border-shopay-gray-light">
      <div className="container mx-auto px-4">
        <ul className="flex items-center gap-6 overflow-x-auto py-3 no-scrollbar whitespace-nowrap">
          <li className="flex-shrink-0">
            <Link href="/" className="text-shopay-black hover:text-shopay-purple font-semibold text-sm transition-colors">
              الرئيسية
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id} className="flex-shrink-0">
              <Link 
                href={`/category/${category.codePrefix}`} 
                className="text-shopay-black/80 hover:text-shopay-purple font-medium text-sm transition-colors"
              >
                {category.nameAr}
              </Link>
            </li>
          ))}
          <li className="flex-shrink-0">
            <Link href="/wholesale" className="text-shopay-purple font-bold text-sm transition-colors flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-shopay-purple animate-pulse"></span>
              عروض الجملة
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
