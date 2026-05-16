"use client";
import { motion } from "framer-motion";

export default function ProgressRing({
  value = 0,
  size = 120,
  stroke = 10,
  color = "#6366f1",
  label,
  sublabel,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor" strokeWidth={stroke} fill="none"
          className="text-gray-200 dark:text-white/10"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{label ?? `${value}%`}</span>
        {sublabel && <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wider">{sublabel}</span>}
      </div>
    </div>
  );
}