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
        if (!section) {
          return;
        }

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
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
          CareerMentorAI
        </Link>

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

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-200 bg-white px-6 py-4 shadow-sm md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-zinc-700 dark:text-zinc-200">
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
