"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Clock, Award, TrendingUp, PlayCircle, Star, 
  Users, Calendar, ChevronRight, Sparkles, Zap, 
  Trophy, Target, Flame, GraduationCap, Heart,
  Coffee, Camera, Code, Music, Palette, Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    fetchDashboardData();
    
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const res = await fetch('/api/student/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setDashboardData(data);
        setEnrolledCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData?.stats || {
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0
  };

  const user = dashboardData?.user || { name: "Student" };
  const profile = dashboardData?.profile || { streak: 0, totalPoints: 0 };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Random gradient backgrounds for courses
  const gradients = [
    "from-purple-500 to-indigo-600",
    "from-pink-500 to-rose-600",
    "from-green-500 to-emerald-600",
    "from-blue-500 to-cyan-600",
    "from-orange-500 to-red-600",
    "from-teal-500 to-green-600"
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">👋</span>
                <p className="text-indigo-100">{currentTime}</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {greeting}, {user.name?.split(' ')[0]}!
              </h1>
              <p className="text-indigo-100 text-lg">
                Ready to continue your learning journey? 🚀
              </p>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-sm text-indigo-100">Streak</span>
                </div>
                <p className="text-xl font-bold">{profile.streak || 0} days</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-indigo-100">Points</span>
                </div>
                <p className="text-xl font-bold">{profile.totalPoints || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-5 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCourses}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Active courses</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-5 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completedCourses}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">🎉 Achievement</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-5 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Hours Learned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalHours}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+{Math.floor(stats.totalHours * 0.1)} this week</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-5 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.averageProgress}%</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Keep going!</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        

        {/* My Courses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              My Learning Journey
            </h2>
            {enrolledCourses.length > 3 && (
              <button 
                onClick={() => router.push('/dashboard/student/courses')}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {enrolledCourses.length === 0 ? (
            <Card className="text-center py-16">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Start your learning journey by enrolling in a course</p>
                <Button onClick={() => router.push('/courses')} className="gap-2">
                  <Sparkles className="w-4 h-4" /> Explore Courses
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 6).map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
                    onClick={() => router.push(`/dashboard/student/courses/${course.id}`)}
                  >
                    {/* Thumbnail with gradient overlay */}
                    <div className={`relative h-44 bg-gradient-to-r ${gradients[index % gradients.length]} overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition"></div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-1 text-white text-sm">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>4.5</span>
                          <span className="text-white/70">• {course.level || 'Beginner'}</span>
                        </div>
                      </div>
                      {/* Category icon */}
                      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur rounded-full p-2">
                        {course.category === 'Web Development' && <Code className="w-4 h-4 text-white" />}
                        {course.category === 'Design' && <Palette className="w-4 h-4 text-white" />}
                        {course.category === 'Music' && <Music className="w-4 h-4 text-white" />}
                        {course.category === 'Photography' && <Camera className="w-4 h-4 text-white" />}
                        {!course.category && <Globe className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.instructor || 'Expert Instructor'}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          />
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.completedLessons || 0}/{course.totalLessons || 0} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {Math.floor(course.progress / 20)} badges
                        </span>
                      </div>
                      
                      <Button 
                        variant="outline"
                        className="w-full mt-auto gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                      >
                        <PlayCircle className="w-4 h-4" /> 
                        {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Motivation Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4">
            <p className="text-gray-600 dark:text-gray-300 italic">
              "The beautiful thing about learning is that no one can take it away from you." - B.B. King
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}