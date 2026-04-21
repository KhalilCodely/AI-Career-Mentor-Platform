"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth-client";

export default function UserboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Simple client-side route protection (run once on mount)
  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
    }
  }, [router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Skills", href: "/userboard/skills" },
    { label: "Career Path", href: "/userboard/career-path" },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex-col gap-6">
        <div className="text-lg font-semibold text-zinc-900 dark:text-white">
          User Board
        </div>

        <nav className="space-y-1 text-sm">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sliding sidebar (left) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <aside className="relative w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-6">
            <div className="text-lg font-semibold text-zinc-900 dark:text-white">
              User Board
            </div>

            <nav className="space-y-1 text-sm">
              {navItems.map((item) => {
                const active = pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-md transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>

            <div className="font-semibold text-zinc-900 dark:text-white">
              CareerMentor User Board
            </div>
          </div>

          <button
            onClick={() => {
              clearAuth();
              router.push("/login");
            }}
            className="text-sm text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
