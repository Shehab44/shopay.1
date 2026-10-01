import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AccountSidebar from "@/components/account/AccountSidebar";

export const metadata = {
  title: "حسابي - SHOPAY",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-shopay-black mb-8">حسابي</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar user={{ name: session.user.name, phone: (session.user as any).phone }} />
        
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
