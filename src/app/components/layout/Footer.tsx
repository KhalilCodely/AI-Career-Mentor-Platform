"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] text-white overflow-hidden">
      
      {/* 🌌 Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-100` h-100` bg-blue-600/20 blur-[120px] rounded-full -top-25 -left-25 animate-pulse" />
        <div className="absolute w-100`h-100` bg-purple-600/20 blur-[120px] rounded-full -bottom-25 -right-25 animate-pulse" />
      </div>

      {/* Main */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-4 gap-12"
      >
        
        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold mb-4 bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Career Mentor AI
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering your career journey with AI-driven insights and tools.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="font-semibold mb-4">Product</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            {["Features", "AI Mentor", "Roadmaps", "Resume Builder"].map((item) => (
              <li
                key={item}
                className="hover:text-white hover:translate-x-1 transition cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            {["About", "Careers", "Blog", "Contact"].map((item) => (
              <li
                key={item}
                className="hover:text-white hover:translate-x-1 transition cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-4">Stay Updated</h3>
          <p className="text-sm text-gray-400 mb-5">
            Get career tips and updates directly to your inbox.
          </p>

          <div className="flex group">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 w-full rounded-l-lg bg-white/5 border border-white/10 outline-none backdrop-blur-md focus:border-blue-500 transition"
            />

            <button className="px-5 rounded-r-lg bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium hover:scale-105 transition">
              Subscribe
            </button>
          </div>
        </div>

      </motion.div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-6 px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        
        <p>© {new Date().getFullYear()} TechTalks-GroupD-Career Mentor AI. All rights reserved.</p>

        <div className="flex gap-6 mt-4 md:mt-0">
          {["Privacy", "Terms", "Cookies"].map((item) => (
            <span
              key={item}
              className="hover:text-white hover:scale-105 transition cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>

      </div>

    </footer>
  );
}