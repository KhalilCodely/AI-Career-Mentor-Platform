"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { name: "Features", href: "#features" },
  { name: "AI Demo", href: "#ai-demo" },
  { name: "Dashboard", href: "#dashboard" },
  { name: "Reviews", href: "#reviews" },
];

export default function Navbar() {
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
          ? "border-zinc-200 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90"
          : "border-transparent bg-transparent"
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
        <div className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`transition ${
                active === link.href
                  ? "font-medium text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {link.name}
            </a>
          ))}

          <Link
            href="/signup"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
        >
          Menu
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-zinc-200 bg-white px-6 py-4 shadow-sm md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-700 dark:text-zinc-200"
              >
                {link.name}
              </a>
            ))}

            <Link
              href="/signup"
              className="mt-1 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm text-white dark:bg-white dark:text-zinc-900"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}