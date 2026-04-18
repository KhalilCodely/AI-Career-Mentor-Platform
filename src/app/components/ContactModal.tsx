"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* 🔥 Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* 🚀 Modal */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10 border border-zinc-200 dark:border-zinc-800"
          >
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message sent (fake for now)");
                onClose();
              }}
              className="space-y-4"
            >
              {/* Email */}
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder="Your email"
                required
                className="w-full p-3 rounded-lg border dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-black/20"
              />

              {/* Message */}
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                placeholder="Your message"
                required
                className="w-full p-3 rounded-lg border h-28 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-black/20"
              />

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg shadow-md hover:shadow-xl transition"
              >
                Send Message
              </motion.button>
            </form>

            {/* ❌ Close */}
            <motion.button
              whileHover={{ scale: 1.2, rotate: 90 }}
              onClick={onClose}
              className="absolute top-3 right-3 text-zinc-500 hover:text-black dark:hover:text-white"
            >
              ✕
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}