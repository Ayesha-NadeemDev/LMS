"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, TrendingUp, FileText,
  Award, Settings, GraduationCap, LogOut, X,Users
} from "lucide-react";
import { useStudent } from "@/context/StudentContext";

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
  { icon: BookOpen, label: "My Courses", href: "/dashboard/student/courses" },
  { icon: TrendingUp, label: "Progress", href: "/dashboard/student/progress" },
  { icon: FileText, label: "Assignments", href: "/dashboard/student/assignments" },
  { icon: Award, label: "Certificates", href: "/dashboard/student/certificates" },
  { icon: Settings, label: "Settings", href: "/dashboard/student/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useStudent();

  // Fixed isActive function for proper route matching
  const isActive = (href) => {
    if (href === "/dashboard/student") {
      // Dashboard active only on exact match
      return pathname === href;
    }
    // Other routes: match exact or sub-pages
    return pathname === href || pathname.startsWith(href + "/");
  };

  const SidebarContent = (
    <>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/70 dark:border-white/5">
        <Link href="/dashboard/student" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <GraduationCap className="text-white" size={20} />
          </motion.div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            EduHub
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em]">
          Menu
        </p>

        {nav.map((item, i) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 group"
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/20 dark:to-purple-400/20 border border-indigo-500/20 dark:border-indigo-400/30"
                    style={{ boxShadow: "0 0 20px rgba(99,102,241,0.15)" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.span
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  className={`relative z-10 ${
                    active
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                </motion.span>
                <span
                  className={`relative z-10 ${
                    active
                      ? "text-gray-900 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="sidebar-dot"
                    className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"
                    style={{ boxShadow: "0 0 8px currentColor" }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200/70 dark:border-white/5">
        <div className="glass rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-semibold">28-day streak</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Keep it going! Learn 15 min today to maintain.
          </p>
        </div>
        <motion.button
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition"
        >
          <LogOut size={18} /> Logout
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Slide-in */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-40 h-screen w-64 glass-strong flex flex-col lg:hidden"
          >
            {SidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sticky */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-64 glass-strong border-r border-gray-200/70 dark:border-white/5 flex-col shrink-0">
        {SidebarContent}
      </aside>
    </>
  );
}