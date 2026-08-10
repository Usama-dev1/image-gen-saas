"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Wand2, Layers, LogOut, 
  Menu, X, Image as ImageIcon, Users, Bookmark, Settings, CreditCard 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { useState, useEffect } from "react";

const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/studio", icon: Wand2, label: "Studio" },
  { href: "/dashboard/batch", icon: Layers, label: "Batch" },
];

const libraryNavItems = [
  { href: "/dashboard/generations", icon: ImageIcon, label: "Generations" },
  { href: "/dashboard/characters", icon: Users, label: "Characters" },
  { href: "/dashboard/prompts", icon: Bookmark, label: "Saved Prompts" },
];

const accountNavItems = [
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing & Plan" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      {/* Full Screen Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-md pb-24 overflow-y-auto animate-in fade-in duration-200">
          <div className="p-6 space-y-8 flex flex-col min-h-full">
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-semibold tracking-tight">Consistent AI</span>
              <button onClick={() => setMenuOpen(false)} className="btn btn-ghost btn-icon p-2">
                <X className="size-6" />
              </button>
            </div>
            
            <div className="space-y-8 flex-1">
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Library</h2>
                <div className="space-y-2">
                  {libraryNavItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-colors",
                        pathname === item.href ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="size-6" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
                <div className="space-y-2">
                  {accountNavItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-colors",
                        pathname === item.href ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="size-6" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

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
              className="flex items-center gap-4 p-4 rounded-xl text-destructive hover:bg-destructive/10 transition-colors mt-auto w-full btn-logout"
            >
              <LogOut className="size-6" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-20 pb-4 bg-background/80 backdrop-blur-xl border-t border-border flex justify-around items-center px-2">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-14 transition-colors rounded-lg",
                isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("size-6", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 h-14 transition-colors rounded-lg",
            menuOpen ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {menuOpen ? <X className={cn("size-6", menuOpen && "text-primary")} /> : <Menu className="size-6" />}
          <span className="text-[10px] font-medium">{menuOpen ? "Close" : "Menu"}</span>
        </button>
      </nav>
    </>
  );
}
