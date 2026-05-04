"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  Brain,
  LogOut,
  Menu,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Profile", icon: User, path: "/dashboard/profile" },
  { name: "Courses", icon: BookOpen, path: "/dashboard/courses" },
  { name: "Skills", icon: Brain, path: "/dashboard/skills" },
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
        bg-black text-white h-screen flex flex-col border-r
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        {!collapsed && (
          <h2 className="text-lg font-semibold">
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
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
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
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-gray-800">

        {/* USER INFO */}
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

        {/* LOGOUT */}
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