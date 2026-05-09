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
  User,
} from "lucide-react";

const navSections = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Roadmap", icon: Map, path: "/dashboard/roadmap" },
      { name: "AI Chat Mentor", icon: Bot, path: "/dashboard/ai-chat" },
      { name: "Career Paths", icon: Milestone, path: "/dashboard/career-paths" },
    ],
  },
  {
    title: "Profile",
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
        className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-blue-100/70 bg-white/95 text-gray-900 shadow-[12px_0_40px_rgba(37,99,235,0.07)] backdrop-blur-xl transition-all duration-300 md:flex ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <div className="relative border-b border-gray-100 p-4">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigateTo("/dashboard")}
              className={`min-w-0 text-left font-extrabold tracking-tight text-slate-950 transition hover:text-blue-700 ${
                collapsed
                  ? "flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm shadow-sm"
                  : "truncate text-xl"
              }`}
              title="Career Mentor"
            >
              {collapsed ? "CM" : "Career Mentor"}
            </button>

            <button
              onClick={() => setCollapsed((current) => !current)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 transition hover:border-gray-300 hover:bg-blue-50 hover:text-blue-700"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                {!collapsed ? (
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    {section.title}
                  </p>
                ) : null}

                <div className="space-y-1.5">
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
                        className={`group relative flex w-full items-center rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                          collapsed ? "justify-center" : "gap-3"
                        } ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed ? <span>{item.name}</span> : null}
                        {isActive && !collapsed ? (
                          <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-gray-100 p-3">
          {!collapsed ? (
            <div className="mb-3 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 ring-1 ring-blue-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-bold text-gray-900 ring-1 ring-gray-200">
                  U
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-950">User</p>
                  <p className="truncate text-xs font-medium text-gray-500">
                    Member plan
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-2xl px-3 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[1.75rem] border border-gray-200 bg-white/95 p-2 shadow-2xl shadow-gray-950/15 backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {mobileNavItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/dashboard" && pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.path)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
