"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Star, Users, Clock, CheckCircle, Play, ChevronDown, Download, Share2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { getCurrentUser, getToken } from "@/lib/auth";

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  const { toast } = useToast();
  
  const [course, setCourse] = useState(null);
  const [courseCurriculum, setCourseCurriculum] = useState([]);
  const [openSections, setOpenSections] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
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
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    fetchCourseData();
  }, [courseId, router]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Fetch course details from backend
      const courseRes = await fetch(`/api/student/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      
      if (courseData.success) {
        setCourse(courseData.course);
        setCourseCurriculum(courseData.curriculum || []);
        setOpenSections([courseData.curriculum?.[0]?.id]);
        
        // Load user's completed lessons for this course
        const progressRes = await fetch(`/api/student/courses/${courseId}/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const progressData = await progressRes.json();
        
        if (progressData.success) {
          setCompletedLessons(progressData.completedLessons || []);
        }
      } else {
        toast(courseData.error || 'Failed to load course', 'error');
        router.push('/dashboard/student/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast('Failed to load course data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id) =>
    setOpenSections((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleLesson = async (lessonId, title) => {
    try {
      const token = getToken();
      const isCompleted = completedLessons.includes(lessonId);
      
      const response = await fetch(`/api/student/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lessonId,
          completed: !isCompleted
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (!isCompleted) {
          setCompletedLessons((p) => [...p, lessonId]);
          toast(`✅ Completed: ${title}`, "success");
        } else {
          setCompletedLessons((p) => p.filter((x) => x !== lessonId));
          toast(`📖 Marked "${title}" as incomplete`, "info");
        }
        
        // Update course progress
        if (data.courseProgress) {
          setCourse(prev => ({ ...prev, progress: data.courseProgress }));
        }
      } else {
        toast(data.error || 'Failed to update progress', 'error');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast('Something went wrong', 'error');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: course?.title || 'Course',
      text: `I'm learning ${course?.title} on EduHub!`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast('Shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast('Link copied to clipboard!', 'success');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[60vh] ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Course not found</p>
        <button onClick={() => router.back()} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded">
          Go Back
        </button>
      </div>
    );
  }

  const totalLessons = courseCurriculum.reduce((sum, section) => sum + (section.lessons?.length || 0), 0);
  const completedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative group cursor-pointer">
                <img 
                  src={course.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop"} 
                  alt={course.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative w-20 h-20 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition shadow-2xl">
                  <Play className="text-indigo-600 ml-1" size={32} fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white text-sm">
                  <span>Lesson {completedCount + 1} / {totalLessons}</span>
                  <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Course Info Card */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <Badge variant="primary">{course.category || 'Course'}</Badge>
                  <h1 className={`text-2xl md:text-3xl font-bold mt-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {course.title}
                  </h1>
                  <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Taught by {course.instructor || 'Expert Instructor'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 size={14} /> Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={14} /> Resources
                  </Button>
                </div>
              </div>

              <div className={`flex flex-wrap items-center gap-6 py-4 border-y ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className="flex items-center gap-1.5 text-sm">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <strong className={darkMode ? 'text-white' : 'text-gray-900'}>{course.rating || 4.8}</strong>
                  <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>({course.reviewCount || 2847} reviews)</span>
                </span>
                <span className={`flex items-center gap-1.5 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users size={16} /> {course.students || 12450} students
                </span>
                <span className={`flex items-center gap-1.5 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock size={16} /> {course.duration || 18} hours total
                </span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Your Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">{progressPercent}%</span>
                </div>
                <ProgressBar value={progressPercent} />
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {completedCount} of {totalLessons} lessons completed
                </p>
              </div>

              <Button className="mt-4">
                <CheckCircle size={16} /> Mark current lesson as complete
              </Button>
            </Card>
          </div>

          {/* Sidebar - Course Curriculum */}
          <div>
            <Card className="p-5 lg:sticky lg:top-20">
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Course Curriculum</h3>
              <div className="space-y-2">
                {courseCurriculum.map((section) => {
                  const isOpen = openSections.includes(section.id);
                  const sectionCompletedCount = section.lessons?.filter(l => completedLessons.includes(l.id)).length || 0;
                  const sectionTotal = section.lessons?.length || 0;
                  
                  return (
                    <div key={section.id} className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button 
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left`}
                      >
                        <div>
                          <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {section.title}
                          </p>
                          <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {sectionTotal} lessons • {section.duration || '2h 30m'} 
                            {sectionCompletedCount > 0 && ` • ${sectionCompletedCount}/${sectionTotal} completed`}
                          </p>
                        </div>
                        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      
                      {isOpen && (
                        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          {section.lessons?.map((lesson, idx) => {
                            const done = completedLessons.includes(lesson.id);
                            return (
                              <button 
                                key={lesson.id} 
                                onClick={() => toggleLesson(lesson.id, lesson.title)}
                                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left ${lesson.current ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}
                              >
                                {done ? (
                                  <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                                ) : (
                                  <Play className="text-gray-400 shrink-0" size={18} />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm truncate ${done ? "line-through text-gray-400 dark:text-gray-500" : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {idx + 1}. {lesson.title}
                                  </p>
                                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {lesson.duration || '10 min'}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}