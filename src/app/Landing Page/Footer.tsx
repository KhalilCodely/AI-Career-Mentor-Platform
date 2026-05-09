"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import ContactModal from "./ContactModal";

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="relative isolate overflow-hidden border-t border-zinc-200 bg-zinc-950 text-white dark:border-white/10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_80%_100%,rgba(168,85,247,0.18),transparent_30%)]" />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-black tracking-tight">CareerMentorAI</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-300">
            AI-powered platform to guide your career, improve your skills, and help you land your dream job faster.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-blue-100"
          >
            Build my roadmap
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-bold">Product</h3>
          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
            <li><a className="transition hover:text-white" href="#features">Features</a></li>
            <li><a className="transition hover:text-white" href="#ai-demo">AI Demo</a></li>
            <li><a className="transition hover:text-white" href="#dashboard">Dashboard</a></li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-bold">Company</h3>
          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
            <li><Link className="transition hover:text-white" href="/login">Login</Link></li>
            <li><Link className="transition hover:text-white" href="/register">Sign Up</Link></li>
            <li>
              <button
                onClick={() => setOpen(true)}
                className="transition hover:text-white"
              >
                Contact
              </button>
            </li>
          </ul>
        </motion.div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-sm text-zinc-400">
        © 2026 CareerMentorAI. All rights reserved.
      </div>

      <ContactModal open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}
