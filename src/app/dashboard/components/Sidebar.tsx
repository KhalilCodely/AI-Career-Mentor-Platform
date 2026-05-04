"use client";

import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-64 bg-black text-white h-screen p-5 flex flex-col">

      <h2 className="text-xl font-bold mb-8">Career Mentor</h2>

      <nav className="flex flex-col gap-4">
        <button onClick={() => router.push("/dashboard")}>🏠 Dashboard</button>
        <button onClick={() => router.push("/dashboard/profile")}>👤 Profile</button>
        <button onClick={() => router.push("/dashboard/courses")}>📚 Courses</button>
        <button onClick={() => router.push("/dashboard/skills")}>🧠 Skills</button>
      </nav>

      <div className="mt-auto">
        <button
          onClick={() => router.push("/logout")}
          className="bg-red-500 px-3 py-2 rounded mt-6"
        >
          Logout
        </button>
      </div>

    </div>
  );
}