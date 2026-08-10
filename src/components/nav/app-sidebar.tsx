"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wand2, Layers, Image, LogOut, Users, Bookmark, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/studio", icon: Wand2, label: "Studio" },
  { href: "/dashboard/batch", icon: Layers, label: "Batch" },
];

const libraryNavItems = [
  { href: "/dashboard/generations", icon: Image, label: "Generations" },
  { href: "/dashboard/characters", icon: Users, label: "Characters" },
  { href: "/dashboard/prompts", icon: Bookmark, label: "Saved Prompts" },
];

const accountNavItems = [
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing & Plan" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="hidden md:flex flex-col w-56 h-screen bg-background border-r border-border sticky top-0 flex-shrink-0 z-40">
      <div className="h-16 flex items-center px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight"
        >
          Consistent AI
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "btn w-full justify-start",
                  isActive ? "btn-secondary" : "btn-ghost"
                )}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <h2 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Library
          </h2>
          <div className="space-y-0.5">
            {libraryNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "btn w-full justify-start",
                    isActive ? "btn-secondary" : "btn-ghost text-muted-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <div className="space-y-0.5">
            {accountNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "btn w-full justify-start",
                    isActive ? "btn-secondary" : "btn-ghost text-muted-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={async () => {
            await signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/");
                },
              },
            });
          }}
          className="btn btn-ghost w-full justify-start btn-logout"
        >
          <LogOut className="size-4 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
