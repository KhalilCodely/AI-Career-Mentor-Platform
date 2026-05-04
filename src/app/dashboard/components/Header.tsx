"use client";

import { useState } from "react";
import { Menu, Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            <Menu size={20} />
          </button>

          {/* Logo / Title */}
          <h1 className="text-lg md:text-xl font-semibold">
            Career Mentor
          </h1>
        </div>

        {/* CENTER (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <button
            onClick={() => router.push("/dashboard")}
            className="hover:text-black transition"
          >
            Dashboard
          </button>

          <button
            onClick={() => router.push("/skills")}
            className="hover:text-black transition"
          >
            Skills
          </button>

          <button
            onClick={() => router.push("/profile")}
            className="hover:text-black transition"
          >
            Profile
          </button>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
              U
            </div>

            <span className="hidden md:block text-sm text-gray-600">
              Welcome back 👋
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden border-t px-4 py-3 space-y-2 bg-white">
          <button
            onClick={() => router.push("/dashboard")}
            className="block w-full text-left text-sm hover:text-black"
          >
            Dashboard
          </button>

          <button
            onClick={() => router.push("/skills")}
            className="block w-full text-left text-sm hover:text-black"
          >
            Skills
          </button>

          <button
            onClick={() => router.push("/profile")}
            className="block w-full text-left text-sm hover:text-black"
          >
            Profile
          </button>
        </div>
      )}
    </header>
  );
}