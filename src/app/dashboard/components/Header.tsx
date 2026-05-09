"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Sparkles } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Roadmap", path: "/dashboard/roadmap" },
  { name: "AI Chat", path: "/dashboard/ai-chat" },
  { name: "Courses", path: "/dashboard/courses" },
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
    <header className="sticky top-0 z-40 border-b-[3px] border-[#2d2a24] bg-[#fff8df]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border-[3px] border-[#2d2a24] bg-white text-[#2d2a24] shadow-[3px_3px_0_#2d2a24] transition hover:-translate-y-0.5 hover:bg-[#dff5ff] md:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-label="Toggle dashboard navigation"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigateTo("/dashboard")}
            className="rounded-full border-[3px] border-[#2d2a24] bg-[#ffcf70] px-3 py-2 text-sm font-black tracking-tight text-[#2d2a24] shadow-[3px_3px_0_#2d2a24] transition hover:-translate-y-0.5 md:hidden"
          >
            Career Mentor
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-[#8a6b1d]">Dashboard</p>
              <span className="hidden items-center gap-1 rounded-full border-2 border-[#2d2a24] bg-[#bdecc7] px-2 py-0.5 text-[11px] font-black text-[#1e6240] sm:inline-flex">
                <Sparkles className="h-3 w-3" /> Active
              </span>
            </div>
            <h1 className="truncate text-lg font-black tracking-tight text-[#2d2a24] md:text-xl">{currentPage}</h1>
          </div>
        </div>

        <nav className="hidden items-center rounded-2xl border-[3px] border-[#2d2a24] bg-white p-1 text-sm font-black text-[#5f574d] shadow-[4px_4px_0_#2d2a24] lg:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));

            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.path)}
                className={`rounded-xl px-4 py-2 transition ${
                  isActive ? "bg-[#ff8f70] text-white" : "hover:bg-[#fff2bd] hover:text-[#2d2a24]"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <label className="hidden h-11 w-64 items-center gap-2 rounded-2xl border-[3px] border-[#2d2a24] bg-white px-4 text-sm font-bold text-[#8a7c64] shadow-[3px_3px_0_#2d2a24] transition focus-within:bg-[#fffdf7] xl:flex">
            <Search className="h-4 w-4" />
            <input
              type="search"
              placeholder="Search your quests..."
              className="w-full bg-transparent text-[#2d2a24] outline-none placeholder:text-[#8a7c64]"
            />
          </label>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border-[3px] border-[#2d2a24] bg-white text-[#2d2a24] shadow-[3px_3px_0_#2d2a24] transition hover:-translate-y-0.5 hover:bg-[#dff5ff]" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-3 w-3 rounded-full border-2 border-[#2d2a24] bg-[#ff8f70]" />
          </button>

          <button className="hidden items-center gap-3 rounded-2xl border-[3px] border-[#2d2a24] bg-white py-1.5 pl-1.5 pr-3 text-left shadow-[3px_3px_0_#2d2a24] transition hover:-translate-y-0.5 hover:bg-[#fffdf7] sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#2d2a24] bg-[#bdecc7] text-sm font-black text-[#2d2a24]">
              U
            </span>
            <span className="hidden lg:block">
              <span className="block text-sm font-black leading-4 text-[#2d2a24]">Welcome back</span>
              <span className="block text-xs font-bold text-[#756b5a]">Keep growing</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-[#756b5a] lg:block" />
          </button>

          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border-[3px] border-[#2d2a24] bg-white text-[#b13b3b] shadow-[3px_3px_0_#2d2a24] transition hover:-translate-y-0.5 hover:bg-[#ffe5e5]"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t-[3px] border-[#2d2a24] bg-[#fff8df]/95 px-4 py-3 shadow-lg md:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));

              return (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className={`rounded-2xl border-[3px] px-4 py-3 text-left text-sm font-black transition ${
                    isActive
                      ? "border-[#2d2a24] bg-[#ff8f70] text-white shadow-[3px_3px_0_#2d2a24]"
                      : "border-transparent text-[#5f574d] hover:border-[#2d2a24] hover:bg-white hover:text-[#2d2a24]"
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
