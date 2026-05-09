"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { name: "Features", href: "#features" },
  { name: "AI Demo", href: "#ai-demo" },
  { name: "Dashboard", href: "#dashboard" },
  { name: "Reviews", href: "#reviews" },
];

export default function NavBar() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = links.map((l) => document.querySelector(l.href));
      sections.forEach((section, index) => {
        if (!section) return;

        const rect = section.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(links[index].href);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-zinc-200/80 bg-white/85 shadow-lg shadow-zinc-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/20"
          : "border-transparent bg-white/40 backdrop-blur-sm dark:bg-zinc-950/20"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* 🔥 LOGO */}
        <Link href="/" className="flex items-center gap-3 group">

  {/* 🔥 Advanced Logo Icon */}
  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg transition group-hover:scale-105">

    {/* Glow ring */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-30 blur-md"></div>

    {/* SVG icon */}
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="relative h-5 w-5"
      stroke="white"
      strokeWidth="1.8"
    >
      {/* Brain / network */}
      <path d="M8 12a4 4 0 018 0M6 12a6 6 0 0112 0" strokeLinecap="round"/>
      <circle cx="8" cy="12" r="1" fill="white"/>
      <circle cx="16" cy="12" r="1" fill="white"/>
      <circle cx="12" cy="8" r="1" fill="white"/>
      <circle cx="12" cy="16" r="1" fill="white"/>

      {/* Growth arrow */}
      <path d="M10 14l2-2 2 2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>

  {/* 🔥 Brand Text */}
  <div className="flex flex-col leading-tight">

    {/* Main brand */}
    <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
      Career Mentor
    </span>

    {/* Subtitle */}
    <div className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        AI Guidance
      </span>

      {/* Small badge */}
      <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-2 py-[2px] text-[9px] font-bold text-white">
        AI
      </span>
    </div>

  </div>
</Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 p-1 text-sm shadow-sm backdrop-blur md:flex dark:border-white/10 dark:bg-white/5">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 font-medium transition ${
                active === link.href
                  ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {link.name}
            </a>
          ))}

          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/30"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-xl border border-zinc-300 bg-white/80 px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm md:hidden dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
        >
          Menu
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-zinc-200 bg-white/95 px-6 py-4 shadow-lg backdrop-blur md:hidden dark:border-white/10 dark:bg-zinc-950/95">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                {link.name}
              </a>
            ))}

            <Link
              href="/register"
              className="mt-1 inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}