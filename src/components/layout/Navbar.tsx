import Link from 'next/link';
import prisma from '@/lib/db';
import { Menu } from 'lucide-react';

export default async function Navbar() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' }
  });

  return (
    <nav className="w-full bg-shopay-purple text-white shadow-md">
      <div className="container mx-auto px-4 flex items-center">
        <Link href="/category/all" className="flex items-center gap-2 bg-black/10 hover:bg-black/20 px-6 py-3 font-bold transition-colors border-l border-white/10 shrink-0">
          <Menu className="w-5 h-5" />
          الكل
        </Link>
        <ul className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap px-4 py-3 gap-6 flex-1">
          {categories.map((category) => (
            <li key={category.id} className="flex-shrink-0">
              <Link 
                href={`/category/${category.id}`} 
                className="text-white hover:text-amber-400 font-bold text-sm transition-colors"
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
