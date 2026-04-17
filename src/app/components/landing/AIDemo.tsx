"use client";

import { motion } from "framer-motion";

export default function AIDemo() {
  return (
    <section
      id="ai-demo"
      className="relative py-28 px-6 bg-[#050505] text-white overflow-hidden"
    >
      {/* 🌌 Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-100 h-100 bg-blue-600/10 blur-[140px] rounded-full -top-25 -left-25" />
        <div className="absolute w-100 h-100 bg-purple-600/10 blur-[140px] rounded-full -bottom-25 -right-25" />

        {/* subtle animated layer */}
        <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/2 to-transparent animate-pulse" />
      </div>

      {/* Title */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Talk to Your{" "}
          <span className="bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            AI Career Mentor
          </span>
        </h2>

        <p className="text-gray-500 max-w-xl mx-auto">
          Ask anything about your career and get intelligent, personalized guidance instantly.
        </p>
      </div>

      {/* Chat */}
      <div className="max-w-3xl mx-auto perspective-1000">
        
        <motion.div
          initial={{ opacity: 0, rotateX: 10, y: 50 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:scale-[1.01] transition"
        >
          <div className="space-y-5">

            {/* User */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex justify-end"
            >
              <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl max-w-xs">
                What career path fits my skills?
              </div>
            </motion.div>

            {/* AI */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl max-w-sm text-gray-300">
                Based on your profile, Full Stack Development is a great fit.
                You already have strong frontend skills.
              </div>
            </motion.div>

            {/* User */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end"
            >
              <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl max-w-xs">
                What should I learn next?
              </div>
            </motion.div>

            {/* AI */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl max-w-sm text-gray-300">
                Focus on Node.js, APIs, and databases. Start with PostgreSQL and backend architecture.
              </div>
            </motion.div>

          </div>

          {/* Input */}
          <div className="mt-6 flex gap-2">
            <input
              placeholder="Ask your AI mentor..."
              className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
            />

            <button className="px-5 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium hover:scale-105 transition">
              Send
            </button>
          </div>

        </motion.div>

      </div>
    </section>
  );
}