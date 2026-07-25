"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Wand2, Layers, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/studio", icon: Wand2, label: "Studio" },
  { href: "/dashboard/batch", icon: Layers, label: "Batch" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-t border-border flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "btn h-auto py-2 flex-col gap-1 w-full max-w-16 !px-1 !rounded-full !text-xs",
              isActive ? "btn-secondary" : "btn-ghost text-muted-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
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
        className={cn(
          "btn h-auto py-2 flex-col gap-1 w-full max-w-16 !px-1 !rounded-full !text-xs",
          "btn-ghost btn-logout"
        )}
      >
        <LogOut className="size-5" />
        <span>Logout</span>
      </button>
    </nav>
  );
}
