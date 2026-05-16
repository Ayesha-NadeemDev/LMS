"use client";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useStudent } from "@/context/StudentContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useStudent();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className="relative w-11 h-11 rounded-xl glass flex items-center justify-center overflow-hidden"
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ y: -20, opacity: 0, rotate: -90 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 20, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
      </motion.div>
    </motion.button>
  );
}