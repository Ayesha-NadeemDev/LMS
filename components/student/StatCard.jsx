"use client";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

export default function StatCard({ icon: Icon, label, value, suffix = "", decimals = 0, change, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative glass rounded-2xl p-5 overflow-hidden group cursor-pointer"
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="text-white" size={20} />
          </div>
          {change && (
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <h3 className="text-3xl font-bold mt-1">
          <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
        </h3>
      </div>
    </motion.div>
  );
}