"use client";
import { Bell, Search, Menu, Sun, Moon, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { currentUser, notifications } from "@/lib/dummy-data";

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
            <Menu size={20} />
          </button>
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search courses, lessons..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none text-sm transition" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            aria-label="Toggle theme">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotif && <NotificationsDropdown onClose={() => setShowNotif(false)} />}
          </div>

          <div className="relative">
            <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
              <span className="hidden md:block text-sm font-medium">{currentUser.name}</span>
              <ChevronDown size={14} className="hidden md:block" />
            </button>
            {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
}

function NotificationsDropdown({ onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-40 animate-slide-up overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h4 className="font-semibold">Notifications</h4>
          <button className="text-xs text-primary-600 hover:underline">Mark all read</button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className={`px-4 py-3 border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition ${n.unread ? "bg-primary-50/50 dark:bg-primary-900/10" : ""}`}>
              <div className="flex gap-3">
                {n.unread && <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ProfileDropdown({ onClose }) {
  const items = [
    { icon: User, label: "My Profile" },
    { icon: Settings, label: "Settings" },
    { icon: LogOut, label: "Logout", danger: true },
  ];
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-40 animate-slide-up overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <p className="font-medium text-sm">{currentUser.name}</p>
          <p className="text-xs text-gray-500">{currentUser.email}</p>
        </div>
        <div className="py-1">
          {items.map((item) => (
            <button key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition ${item.danger ? "text-red-600" : ""}`}>
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}