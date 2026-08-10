"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function MobileMenu({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const router = useRouter();
  return (
    <div className="sm:hidden">
      <details className="group">
        <summary className="list-none fixed top-0 right-0 btn btn-ghost btn-icon z-50 mt-[calc(1.25rem)] mr-6 p-2">
          <Menu className="size-6 group-open:hidden" />
          <X className="size-6 hidden group-open:block" />
        </summary>
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-in slide-in-from-right duration-300">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="btn btn-ghost btn-lg text-lg"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn btn-primary btn-lg text-lg"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="btn btn-ghost btn-lg text-lg"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/");
                        router.refresh();
                      },
                    },
                  });
                }}
                className="btn btn-ghost btn-lg text-lg btn-logout"
              >
                Logout
              </button>
            </>
          )}
          <Link
            href="/dashboard/studio"
            className="btn btn-primary btn-lg text-lg"
          >
            Get Started
          </Link>
        </div>
      </details>
    </div>
  );
}
