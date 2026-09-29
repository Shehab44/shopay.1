import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ products: [] });
  }

  const q = query.trim();
  const words = q.split(/\s+/).filter(word => word.length > 0);

  try {
    const searchConditions = words.map(word => ({
      OR: [
        { nameAr: { contains: word } },
        { matCode: { contains: word } },
        { description: { contains: word } }
      ]
    }));

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { gt: 0 },
        AND: searchConditions
      },
      select: {
        id: true,
        nameAr: true,
        matCode: true,
        price: true,
        mainImageUrl: true,
      },
      take: 5,
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
