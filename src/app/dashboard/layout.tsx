import { AppSidebar } from "@/components/nav/app-sidebar";
import { MobileNav } from "@/components/nav/mobile-nav";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
