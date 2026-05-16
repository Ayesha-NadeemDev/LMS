"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  BookOpen, Clock, Target, Award, 
  ChevronRight, PlayCircle, Loader2
} from "lucide-react";
import { getCurrentUser, getToken } from "@/lib/auth";

export default function ProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    overallProgress: 0,
    totalHours: 0
  });

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
    const fetchData = async () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        router.push("/");
        return;
      }
      
      const token = getToken();
      
      if (currentUser.role !== "student") {
        router.push("/");
        return;
      }
      
      setUser(currentUser);
      
      try {
        const coursesRes = await fetch("/api/student/courses", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const coursesResult = await coursesRes.json();
        
        console.log("API Response:", coursesResult); // Debug log
        
        if (coursesResult.success) {
          const coursesList = coursesResult.courses || [];
          
          // ✅ Ensure each course has a valid ID
          const processedCourses = coursesList.map(course => ({
            ...course,
            validId: course._id || course.id // Store the correct ID
          }));
          
          setCourses(processedCourses);
          
          const total = processedCourses.length;
          const completed = processedCourses.filter(c => c.progress >= 100).length;
          const inProgress = processedCourses.filter(c => c.progress > 0 && c.progress < 100).length;
          const totalProgress = processedCourses.reduce((sum, c) => sum + (c.progress || 0), 0);
          const overall = total > 0 ? Math.round(totalProgress / total) : 0;
          const totalHours = processedCourses.reduce((sum, c) => sum + (c.completedHours || 0), 0);
          
          setStats({
            totalCourses: total,
            completedCourses: completed,
            inProgress: inProgress,
            overallProgress: overall,
            totalHours: totalHours
          });
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  const getStatusBadge = (progress) => {
    if (progress >= 100) {
      return { text: "Completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    }
    if (progress > 0) {
      return { text: "In Progress", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" };
    }
    return { text: "Not Started", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400" };
  };

  const handleViewCourse = (course) => {
    // ✅ Use the correct ID - priority: _id (MongoDB) > id
    const courseId = course._id || course.id;
    console.log("Navigating to course:", courseId, course.title); // Debug log
    
    if (!courseId) {
      console.error("No valid course ID found", course);
      alert("Invalid course ID. Please try again.");
      return;
    }
    
    router.push(`/dashboard/student/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Progress
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Track your learning journey, {user?.name?.split(' ')[0] || 'Student'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-xl p-4 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enrolled</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completedCourses}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>In Progress</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hours</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalHours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className={`rounded-xl p-6 shadow-sm mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Overall Progress</h3>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.overallProgress}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-indigo-600"
            />
          </div>
          <p className={`text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {stats.completedCourses} of {stats.totalCourses} courses completed
          </p>
        </div>

        {/* Course-wise Progress List */}
        <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Course Progress</h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Detailed progress for each enrolled course
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {courses.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No courses enrolled yet</p>
                <button
                  onClick={() => router.push('/dashboard/student/courses')}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              courses.map((course, index) => {
                const status = getStatusBadge(course.progress || 0);
                const courseId = course._id || course.id;
                
                return (
                  <div
                    key={courseId || index}
                    className={`p-5 transition ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Course Title & Status */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="text-2xl">{course.thumbnail || '📘'}</div>
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {course.title}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        
                        {/* Instructor */}
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          👨‍🏫 {course.instructor || "Expert Instructor"}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Progress</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                              {course.progress || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress || 0}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              className="h-full rounded-full bg-indigo-600"
                            />
                          </div>
                        </div>
                        
                        {/* Lessons Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" />
                            {course.completedLessons || 0}/{course.totalLessons || 0} lessons
                          </span>
                        </div>
                      </div>
                      
                      {/* ✅ View Details Button with Correct ID */}
                      <button
                        onClick={() => handleViewCourse(course)}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}