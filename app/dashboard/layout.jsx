"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const role = pathname.includes("/admin")
  ? "admin"
  : pathname.includes("/instructor") ? "instructor" : "student";
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        {/* ✅ Added pt-20 (80px) for significant margin from top */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pt-12 md:pt-14 lg:pt-16 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}