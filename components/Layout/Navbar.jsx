"use client";
import { useState, useEffect } from "react";
import { Bell, Search, User, Menu, X, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/auth/current-user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('lms_current_user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      const userData = localStorage.getItem("lms_current_user") ||
                       localStorage.getItem("user") ||
                       localStorage.getItem("currentUser");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/student/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      let assignments = [];
      if (data.success && Array.isArray(data.assignments)) {
        assignments = data.assignments;
      } else if (data.assignments && Array.isArray(data.assignments)) {
        assignments = data.assignments;
      } else if (Array.isArray(data)) {
        assignments = data;
      }

      const today = new Date();
      const notificationsList = [];
      
      if (Array.isArray(assignments) && assignments.length > 0) {
        assignments.forEach(assignment => {
          if (assignment && assignment.status === 'pending') {
            const dueDate = new Date(assignment.dueDate);
            const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 2 && daysLeft >= 0) {
              notificationsList.push({
                id: assignment.id || `urgent-${Date.now()}`,
                message: `⚠️ "${assignment.title}" is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!`,
                time: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`,
                unread: true,
                type: 'urgent'
              });
            } else if (daysLeft < 0) {
              notificationsList.push({
                id: assignment.id || `overdue-${Date.now()}`,
                message: `❌ "${assignment.title}" is overdue!`,
                time: `Due ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`,
                unread: true,
                type: 'overdue'
              });
            } else if (daysLeft <= 7) {
              notificationsList.push({
                id: assignment.id || `upcoming-${Date.now()}`,
                message: `📝 "${assignment.title}" due in ${daysLeft} days`,
                time: `${daysLeft} days remaining`,
                unread: true,
                type: 'upcoming'
              });
            }
          }
        });
      }

      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => n.unread).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Apply dark mode class to html element
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    // Force re-render of all components
    window.dispatchEvent(new Event('storage'));
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, unread: false } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, unread: false }))
    );
    setUnreadCount(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lms_current_user");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'urgent': return '⚠️';
      case 'overdue': return '❌';
      case 'achievement': return '🏅';
      default: return '📝';
    }
  };

  const getNotificationBg = (type) => {
    switch(type) {
      case 'urgent': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200';
      case 'overdue': return 'bg-red-50 dark:bg-red-900/20 border-red-200';
      case 'achievement': return 'bg-green-50 dark:bg-green-900/20 border-green-200';
      default: return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white md:hidden">
              EduHub
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            
            

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-700 dark:text-gray-300" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell size={18} className="text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No new notifications</p>
                          <p className="text-xs mt-1">You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notif, index) => (
                          <div
                            key={notif.id || index}
                            onClick={() => markAsRead(notif.id)}
                            className={`p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition border-l-4 ${getNotificationBg(notif.type)} ${
                              notif.unread ? "border-l-indigo-500" : "border-l-transparent opacity-70"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                              </div>
                              {notif.unread && (
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1"></span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-2 border-t border-gray-200 dark:border-slate-700 text-center sticky bottom-0 bg-white dark:bg-slate-800">
                        <button
                          onClick={() => router.push('/dashboard/student/assignments')}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                        >
                          View all assignments →
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden md:block text-sm text-gray-700 dark:text-gray-200">
                  {user?.name?.split(" ")[0] || "Student"}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || "Student"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || "student@example.com"}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => router.push("/dashboard/student/settings")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <User size={14} className="inline mr-2" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-20 bg-white dark:bg-slate-900 px-4 py-2 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search courses..."
            className="bg-transparent border-none outline-none px-2 text-sm w-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>
    </>
  );
}