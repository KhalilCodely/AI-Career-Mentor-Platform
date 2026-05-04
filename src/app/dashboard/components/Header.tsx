"use client";

export default function Header() {
  return (
    <div className="w-full bg-white shadow px-6 py-4 flex justify-between">
      <h1 className="font-semibold">Dashboard</h1>

      <div>
        <span className="text-sm text-gray-500">
          Welcome back 👋
        </span>
      </div>
    </div>
  );
}