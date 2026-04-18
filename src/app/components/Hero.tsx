"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center px-6 overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-blue-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">

      {/* 🔵 Animated background blobs */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-3xl top-[-100px] left-[-100px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-3xl bottom-[-100px] right-[-100px]"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* 🔥 Content */}
      <div className="relative z-10">
        
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-zinc-600 bg-clip-text text-transparent dark:from-white dark:to-zinc-400"
        >
          Build Your Career with AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-600 dark:text-zinc-300 mb-8 max-w-xl mx-auto"
        >
          Personalized career paths, resume feedback, and job matching powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          {/* Primary Button */}
          <motion.a
            href="/signup"
            whileHover={{
              scale: 1.08,
              rotate: -1,
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition"
          >
            Start Free
          </motion.a>

          {/* Secondary Button */}
          <motion.a
            href="#features"
            whileHover={{ scale: 1.05 }}
            className="border px-6 py-3 rounded-xl backdrop-blur bg-white/50 dark:bg-zinc-800/50"
          >
            Learn More
          </motion.a>
        </motion.div>

      </div>
    </section>
  );
}