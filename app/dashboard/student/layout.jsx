"use client";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/student/Sidebar";
import Topbar from "@/components/student/Topbar";
import { StudentProvider, useStudent } from "@/context/StudentContext";
import { motion } from "framer-motion";

function ToastRoot() {
  const { toast } = useStudent();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          className="fixed top-20 right-6 z-[100] glass-strong rounded-xl px-5 py-3 shadow-2xl border border-gray-200/70 dark:border-white/10"
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LayoutContent({ children }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />

      {/* <Sidebar /> */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <div key={pathname}>{children}</div>
          </AnimatePresence>
        </main>
      </div>
      <ToastRoot />
    </div>
  );
}

export default function StudentLayout({ children }) {
  return (
    <StudentProvider>
      <LayoutContent>{children}</LayoutContent>
    </StudentProvider>
  );
}