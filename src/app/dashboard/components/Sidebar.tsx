"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Bot,
  Brain,
  FileText,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Map,
  Milestone,
  Menu,
  Sprout,
  User,
} from "lucide-react";

const navSections = [
  {
    title: "Adventure",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Roadmap", icon: Map, path: "/dashboard/roadmap" },
      { name: "AI Chat Mentor", icon: Bot, path: "/dashboard/ai-chat" },
      { name: "Career Paths", icon: Milestone, path: "/dashboard/career-paths" },
    ],
  },
  {
    title: "Character",
    items: [
      { name: "Profile", icon: User, path: "/dashboard/profile" },
      { name: "Skills", icon: Brain, path: "/dashboard/skills" },
      { name: "Resume Checker", icon: FileText, path: "/dashboard/resume-checker" },
    ],
  },
  {
    title: "Learning",
    items: [{ name: "Courses", icon: BookOpen, path: "/dashboard/courses" }],
  },
];

const mobileNavItems = navSections.flatMap((section) => section.items);

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r-[3px] border-[#2d2a24] bg-[#fff8df]/95 text-[#2d2a24] shadow-[10px_0_0_rgba(45,42,36,0.08)] backdrop-blur-xl transition-all duration-300 md:flex ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <div className="relative border-b-[3px] border-[#2d2a24] p-4">
          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#ffd86b]/70" />
          <div className="relative flex items-center justify-between gap-3">
            <button
              onClick={() => navigateTo("/dashboard")}
              className={`min-w-0 text-left font-black tracking-tight transition hover:-translate-y-0.5 ${
                collapsed
                  ? "flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#2d2a24] bg-[#ffcf70] text-sm shadow-[4px_4px_0_#2d2a24]"
                  : "truncate text-xl"
              }`}
              title="Career Mentor"
            >
              {collapsed ? "CM" : "Career Mentor"}
            </button>

            <button
              onClick={() => setCollapsed((current) => !current)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-[#2d2a24] bg-white text-[#2d2a24] shadow-[3px_3px_0_#2d2a24] transition hover:-translate-y-0.5 hover:bg-[#dff5ff]"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
          {!collapsed ? (
            <p className="relative mt-2 text-xs font-bold text-[#756b5a]">
              Cozy tools for clear career progress.
            </p>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                {!collapsed ? (
                  <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#8a7c64]">
                    {section.title}
                  </p>
                ) : null}

                <div className="space-y-2">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.path ||
                      (item.path !== "/dashboard" && pathname.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.name}
                        onClick={() => navigateTo(item.path)}
                        title={collapsed ? item.name : undefined}
                        className={`group relative flex w-full items-center rounded-2xl border-[3px] px-3 py-3 text-sm font-black transition ${
                          collapsed ? "justify-center" : "gap-3"
                        } ${
                          isActive
                            ? "border-[#2d2a24] bg-[#ff8f70] text-white shadow-[4px_4px_0_#2d2a24]"
                            : "border-transparent text-[#5f574d] hover:-translate-y-0.5 hover:border-[#2d2a24] hover:bg-white hover:text-[#2d2a24] hover:shadow-[4px_4px_0_#2d2a24]"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed ? <span>{item.name}</span> : null}
                        {isActive && !collapsed ? (
                          <span className="ml-auto h-2.5 w-2.5 rounded-full border-2 border-[#2d2a24] bg-[#ffd86b]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t-[3px] border-[#2d2a24] p-3">
          {!collapsed ? (
            <div className="mb-3 rounded-3xl border-[3px] border-[#2d2a24] bg-[#dff5ff] p-4 shadow-[4px_4px_0_#2d2a24]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-[3px] border-[#2d2a24] bg-[#bdecc7] text-[#2d2a24]">
                  <Sprout className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#2d2a24]">Learning traveler</p>
                  <p className="truncate text-xs font-bold text-[#665d50]">Member plan</p>
                </div>
              </div>
            </div>
          ) : null}

          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-2xl border-[3px] border-[#2d2a24] bg-white px-3 py-3 text-sm font-black text-[#b13b3b] shadow-[4px_4px_0_#2d2a24] transition hover:-translate-y-0.5 hover:bg-[#ffe5e5] ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[1.5rem] border-[3px] border-[#2d2a24] bg-[#fff8df]/95 p-2 shadow-[0_8px_0_#2d2a24] backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {mobileNavItems.slice(0, 4).map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/dashboard" && pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.path)}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black transition ${
                  isActive ? "bg-[#ff8f70] text-white" : "text-[#5f574d] hover:bg-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{item.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
