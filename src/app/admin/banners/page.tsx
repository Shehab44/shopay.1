import prisma from "@/lib/db";
import BannersClient from "./BannersClient";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-shopay-black">إدارة البانرات الإعلانية</h2>
      </div>
      <BannersClient initialBanners={banners} />
    </div>
  );
}
