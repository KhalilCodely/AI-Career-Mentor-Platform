"use client";

import { Bell, ChevronDown, LogOut, Menu, Search, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Roadmap", path: "/dashboard/roadmap" },
  { name: "Skills", path: "/dashboard/skills" },
  { name: "Profile", path: "/dashboard/profile" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const currentPage =
    navItems
      .filter((item) => pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path)))
      .at(-1)?.name ?? "Workspace";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 md:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-label="Toggle dashboard navigation"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg shadow-gray-950/10 md:hidden">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Dashboard</p>
              <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100 sm:inline-flex">
                Active
              </span>
            </div>
            <h1 className="truncate text-lg font-bold tracking-tight text-gray-950 md:text-xl">{currentPage}</h1>
          </div>
        </div>

        <nav className="hidden items-center rounded-2xl bg-gray-100 p-1 text-sm font-semibold text-gray-600 lg:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));

            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.path)}
                className={`rounded-xl px-4 py-2 transition ${
                  isActive ? "bg-white text-gray-950 shadow-sm" : "hover:text-gray-950"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <label className="hidden h-11 w-64 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-400 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 xl:flex">
            <Search className="h-4 w-4" />
            <input
              type="search"
              placeholder="Search workspace..."
              className="w-full bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
            />
          </label>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>

          <button className="hidden items-center gap-3 rounded-2xl border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 text-left shadow-sm transition hover:border-gray-300 hover:bg-gray-50 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
              U
            </span>
            <span className="hidden lg:block">
              <span className="block text-sm font-bold leading-4 text-gray-950">Welcome back</span>
              <span className="block text-xs font-medium text-gray-500">Keep growing</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-gray-400 lg:block" />
          </button>

          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500 shadow-sm transition hover:border-red-200 hover:bg-red-100"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg md:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));

              return (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    isActive ? "bg-gray-950 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
