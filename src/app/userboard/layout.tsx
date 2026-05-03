"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth-client";

export default function UserboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    if (!auth) {
      router.replace("/login");
    }
  }, [auth, router]);

  const navItems = [
    { label: "Skills", href: "/userboard/skills" },
    { label: "Courses", href: "/userboard/courses" },
    { label: "Profile", href: "/userboard/profile" },
  ];

  const initials = auth?.user?.name
    ? auth.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              ☰
            </button>
            <div className="font-semibold text-zinc-900 dark:text-white">CareerMentor</div>
          </div>

          <nav className="hidden md:flex items-center gap-2 text-sm">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 transition ${
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

          <div className="flex items-center gap-3">
            <Link
              href="/userboard/profile"
              className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-2 py-1 pr-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="hidden sm:block text-sm text-zinc-700 dark:text-zinc-200">
                {auth?.user?.name ?? "Profile"}
              </span>
            </Link>
            <button
              onClick={() => {
                clearAuth();
                router.push("/login");
              }}
              className="text-sm text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 space-y-1 bg-white dark:bg-zinc-900">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm transition ${
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
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</main>
    </div>
  );
}
