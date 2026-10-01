import prisma from "@/lib/db";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-shopay-black">إدارة الأقسام (صور الأقسام)</h2>
      </div>
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
