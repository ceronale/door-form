import { requireAuth } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Skip auth check and layout for login page
  const isLoginPage = pathname === "/admin/login";
  
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For all other admin pages, require auth
  await requireAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 w-full min-w-0">
        <TopBar />
        <div className="p-4 sm:p-4 lg:p-6 xl:p-8">{children}</div>
      </main>
    </div>
  );
}

