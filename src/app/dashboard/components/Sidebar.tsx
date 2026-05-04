"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  Brain,
  Map,
  LogOut,
  Menu,
} from "lucide-react";

const navSections = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Roadmap", icon: Map, path: "/dashboard/roadmap" }, // ✅ ADDED
    ],
  },
  {
    title: "Profile",
    items: [
      { name: "Profile", icon: User, path: "/dashboard/profile" },
      { name: "Skills", icon: Brain, path: "/dashboard/skills" },
    ],
  },
  {
    title: "Learning",
    items: [
      { name: "Courses", icon: BookOpen, path: "/dashboard/courses" },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <aside
      className={`
        bg-black text-white h-screen flex flex-col border-r border-gray-800
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        {!collapsed && (
          <h2 className="text-lg font-semibold tracking-tight">
            Career Mentor
          </h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-800"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">

        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-xs text-gray-500 uppercase px-3 mb-2">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                      ${
                        isActive
                          ? "bg-white text-black font-medium"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{item.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-gray-800">

        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
              U
            </div>
            <div className="text-sm">
              <p className="font-medium">User</p>
              <p className="text-gray-400 text-xs">Member</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}