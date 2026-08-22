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

        </ul>
      </div>
    </nav>
  );
}
