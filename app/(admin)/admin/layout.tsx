// Admin layout with authentication check
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  if (!user.isWhitelisted) {
    redirect("/auth/unauthorized");
  }

  return (
    <div className="admin-theme min-h-[100dvh] bg-background text-foreground relative">
      <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden">
        <AdminSidebar user={user} />
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
