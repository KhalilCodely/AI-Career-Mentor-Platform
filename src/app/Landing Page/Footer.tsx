"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import ContactModal from "./ContactModal";

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="relative bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 border-t border-zinc-200 dark:border-zinc-800 overflow-hidden">

      {/* 🌈 Background Glow */}
      <div className="absolute w-[300px] h-[300px] bg-blue-400/20 blur-3xl rounded-full top-0 left-0"></div>
      <div className="absolute w-[300px] h-[300px] bg-purple-400/20 blur-3xl rounded-full bottom-0 right-0"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">

        {/* 🧠 Brand */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold mb-3">CareerMentorAI</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            AI-powered platform to guide your career, improve your skills,
            and help you land your dream job faster.
          </p>
        </motion.div>

        {/* 📦 Product */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold mb-3">Product</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li><a href="#features">Features</a></li>
            <li><a href="#ai-demo">AI Demo</a></li>
            <li><a href="#dashboard">Dashboard</a></li>
          </ul>
        </motion.div>

        {/* 🏢 Company */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/signup">Sign Up</Link></li>
            <li>
              <button
                onClick={() => setOpen(true)}
                className="hover:text-black dark:hover:text-white transition"
              >
                Contact
              </button>
            </li>
          </ul>
        </motion.div>

      </div>

      {/* 🔻 Bottom */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 text-center py-6 text-sm text-zinc-500">
        © 2026 CareerMentorAI. All rights reserved.
      </div>

      {/* 📩 Contact Modal */}
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}