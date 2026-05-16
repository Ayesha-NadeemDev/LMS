"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getToken } from "@/lib/auth";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    averageProgress: 0,
    totalPoints: 0,
    streak: 0,
    completedCourses: 0,
    totalHours: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Check dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/');
        return;
      }

      // Get current user from our auth helper
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Fallback: fetch user info
        const userRes = await fetch('/api/auth/current-user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.user);
        }
      }

      // Fetch dashboard stats from backend
      const dashRes = await fetch('/api/student/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dashData = await dashRes.json();
      
      if (dashData.success) {
        setStats({
          enrolledCourses: dashData.stats?.enrolledCourses || 0,
          averageProgress: dashData.stats?.averageProgress || 0,
          totalPoints: dashData.profile?.totalPoints || 0,
          streak: dashData.profile?.streak || 0,
          completedCourses: dashData.profile?.completedCourses || 0,
          totalHours: dashData.profile?.totalHours || 0
        });
      }

      // Fetch enrolled courses for display
      const coursesRes = await fetch('/api/student/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      
      if (coursesData.success && coursesData.courses) {
        // Create recent activities from courses
        const activities = coursesData.courses.slice(0, 3).map(course => ({
          id: course.id,
          title: course.title,
          progress: course.progress || 0,
          lastAccessed: course.lastAccessed || new Date().toISOString()
        }));
        setRecentActivities(activities);
      }

    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[60vh] ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button onClick={fetchDashboardData} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Here's your learning progress at a glance
        </p>
      </div>

      {/* Stats Cards - First Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-3xl mb-2">📚</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {stats.enrolledCourses}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enrolled Courses</div>
        </div>
        
        <div className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-3xl mb-2">📊</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {stats.averageProgress}%
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Progress</div>
        </div>
        
        <div className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-3xl mb-2">⭐</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {stats.totalPoints}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Points</div>
        </div>
        
        <div className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-3xl mb-2">🔥</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {stats.streak}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Day Streak</div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800 p-4">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {stats.completedCourses}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Completed Courses</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {stats.totalHours}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Learning Hours</div>
        </div>
      </div>

      {/* Browse Courses Button */}
      <div className="text-center mb-8">
        <Link href="/dashboard/student/courses">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md">
            🎓 Browse All Courses
          </button>
        </Link>
        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Explore new courses and continue your learning journey
        </p>
      </div>

      {/* Recent Courses / Continue Learning */}
      {recentActivities.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            📖 Continue Learning
          </h2>
          <div className="space-y-3">
            {recentActivities.map((course) => (
              <div key={course.id} className={`rounded-xl border p-4 hover:shadow-md transition ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{course.title}</h3>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex-1 min-w-[150px]">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Progress</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      <Link href={`/dashboard/student/courses/${course.id}`}>
                        <button className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900 transition">
                          Continue
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quick Links</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/student/assignments">
            <div className={`rounded-xl border p-4 hover:shadow-md transition cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Assignments</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>View submissions</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/student/progress">
            <div className={`rounded-xl border p-4 hover:shadow-md transition cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Progress</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track learning</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/student/certificates">
            <div className={`rounded-xl border p-4 hover:shadow-md transition cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏅</span>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Certificates</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>View achievements</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}