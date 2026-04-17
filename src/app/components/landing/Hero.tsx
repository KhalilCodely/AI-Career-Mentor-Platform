// src/components/landing/Hero.tsx
"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-black text-white overflow-hidden">

      {/* Gradient Glow */}
      <div className="absolute w-150 h-125 bg-blue-500/20 blur-3xl rounded-full top-0 left-0"></div>
      <div className="absolute w-150 h-125 bg-purple-500/20 blur-3xl rounded-full bottom-0 right-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl z-10"
      >
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          Build Your Future with <span className="text-blue-500">AI</span>
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          Career Mentor AI helps you choose the right path, learn faster,
          and land your dream job with intelligent guidance.
        </p>

        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
          <button className="border px-6 py-3 rounded-lg hover:bg-white hover:text-black transition">
            Live Demo
          </button>
        </div>
      </motion.div>
    </section>
  );
}