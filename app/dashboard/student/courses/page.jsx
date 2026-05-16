"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getToken } from '@/lib/auth';

export default function StudentCoursesPage() {
  const router = useRouter();
  
  // Predefined course data
  const availableCourse = {
    _id: { $oid: "6a0170f86aed1bd3d852d7a7" },
    title: "UI/UX Design Mastery",
    description: "Master user interface and user experience design. Learn Figma, prototyping, user research, and design systems.",
    instructor: "Emily Davis",
    instructorId: "instructor_2",
    thumbnail: "🎨",
    category: "Design",
    level: "intermediate",
    duration: 25,
    lessons: [
      { id: 1, title: "Design Principles", duration: "2 hours" },
      { id: 2, title: "Figma Basics", duration: "3 hours" },
      { id: 3, title: "Wireframing", duration: "2 hours" },
      { id: 4, title: "Prototyping", duration: "3 hours" },
      { id: 5, title: "User Research", duration: "2 hours" },
      { id: 6, title: "Design Systems", duration: "3 hours" }
    ]
  };

  const coursesList = [
    availableCourse,
    {
      _id: { $oid: "7b1281g97aed1bd3d852d7b8" },
      title: "Full Stack Web Dev",
      description: "Learn MERN stack, APIs, and deployment.",
      instructor: "John Carter",
      thumbnail: "💻",
      category: "Development",
      level: "advanced",
      duration: 48,
      lessons: []
    },
    {
      _id: { $oid: "8c2392h08bfe2ce4e963e8c9" },
      title: "Data Science Bootcamp",
      description: "Python, Pandas, ML basics.",
      instructor: "Dr. Sarah Khan",
      thumbnail: "📊",
      category: "Data Science",
      level: "beginner",
      duration: 32,
      lessons: []
    },
    {
      _id: { $oid: "9d3403i19cgf3df5f074f9d0" },
      title: "Digital Marketing Pro",
      description: "SEO, Social Media, Analytics, and Content Strategy.",
      instructor: "Maria Rodriguez",
      thumbnail: "📈",
      category: "Marketing",
      level: "intermediate",
      duration: 20,
      lessons: []
    }
  ];

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(coursesList[0]._id.$oid);
  const [formData, setFormData] = useState({
    enrollmentId: null,
    title: '',
    description: '',
    instructor: '',
    thumbnail: '',
    category: '',
    level: '',
    duration: '',
    lessons: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check for dark mode and get current user
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Get current logged-in user
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }
    setCurrentUser(user);

    return () => observer.disconnect();
  }, [router]);

  // Load enrolled courses for this specific user from localStorage
  useEffect(() => {
    loadFromLocalStorage();
  }, [currentUser]);

  // Save to localStorage whenever enrolledCourses changes
  useEffect(() => {
    if (!isLoading && currentUser) {
      saveToLocalStorage();
    }
  }, [enrolledCourses, isLoading, currentUser]);

  const loadFromLocalStorage = () => {
    try {
      const storageKey = `lms_enrolled_courses_${currentUser?.id || 'guest'}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsedData = JSON.parse(stored);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setEnrolledCourses(parsedData);
        } else {
          setEnrolledCourses([]);
        }
      } else {
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setEnrolledCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLocalStorage = () => {
    try {
      const storageKey = `lms_enrolled_courses_${currentUser?.id || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify(enrolledCourses));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const handleCourseSelect = (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    const selected = coursesList.find(c => c._id.$oid === courseId);
    if (selected && !isEditing) {
      setFormData({
        enrollmentId: null,
        title: selected.title,
        description: selected.description,
        instructor: selected.instructor,
        thumbnail: selected.thumbnail,
        category: selected.category,
        level: selected.level,
        duration: selected.duration,
        lessons: selected.lessons || []
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetFormToSelectedCourse = () => {
    const defaultCourse = coursesList.find(c => c._id.$oid === selectedCourseId) || coursesList[0];
    setFormData({
      enrollmentId: null,
      title: defaultCourse.title,
      description: defaultCourse.description,
      instructor: defaultCourse.instructor,
      thumbnail: defaultCourse.thumbnail,
      category: defaultCourse.category,
      level: defaultCourse.level,
      duration: defaultCourse.duration,
      lessons: defaultCourse.lessons || []
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEnroll = () => {
    if (!formData.title.trim()) {
      alert("Please provide course title");
      return;
    }

    const alreadyExists = enrolledCourses.some(
      course => course.title === formData.title && (!isEditing || course.enrollmentId !== editId)
    );
    
    if (alreadyExists && !isEditing) {
      alert("You are already enrolled in this course!");
      return;
    }

    const newEnrollment = {
      enrollmentId: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      instructor: formData.instructor,
      thumbnail: formData.thumbnail || "📖",
      category: formData.category,
      level: formData.level,
      duration: formData.duration,
      lessons: formData.lessons,
      enrolledAt: new Date().toISOString(),
      userId: currentUser?.id
    };

    let updatedCourses;
    if (isEditing && editId) {
      updatedCourses = enrolledCourses.map(course =>
        course.enrollmentId === editId ? { ...newEnrollment, enrollmentId: editId } : course
      );
      setEnrolledCourses(updatedCourses);
      alert("Enrollment updated successfully!");
    } else {
      updatedCourses = [newEnrollment, ...enrolledCourses];
      setEnrolledCourses(updatedCourses);
      alert("Successfully enrolled in course!");
    }

    setIsEditing(false);
    setEditId(null);
    resetFormToSelectedCourse();
  };

  const handleDelete = (enrollmentId) => {
    if (window.confirm("Are you sure you want to remove this enrollment?")) {
      const filtered = enrolledCourses.filter(course => course.enrollmentId !== enrollmentId);
      setEnrolledCourses(filtered);
      alert("Enrollment removed successfully!");
    }
  };

  const handleEdit = (enrollment) => {
    setIsEditing(true);
    setEditId(enrollment.enrollmentId);
    setFormData({
      enrollmentId: enrollment.enrollmentId,
      title: enrollment.title,
      description: enrollment.description,
      instructor: enrollment.instructor,
      thumbnail: enrollment.thumbnail,
      category: enrollment.category,
      level: enrollment.level,
      duration: enrollment.duration,
      lessons: enrollment.lessons || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    resetFormToSelectedCourse();
  };

  const clearAllEnrollments = () => {
    if (window.confirm("⚠️ Warning: This will delete ALL your enrollments. Are you sure?")) {
      setEnrolledCourses([]);
      alert("All enrollments cleared!");
    }
  };

  const getLessonSummary = (lessons) => {
    if (!lessons || lessons.length === 0) return "No lessons";
    return `${lessons.length} lesson${lessons.length > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with User Name */}
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📚 My Courses
            </h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome, {currentUser?.name?.split(' ')[0] || 'Student'}! Manage your course enrollments
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-gray-800 text-indigo-400' : 'bg-white text-indigo-600'} shadow-sm`}>
            🎓 Enrolled: {enrolledCourses.length} {enrolledCourses.length === 1 ? 'course' : 'courses'}
            {enrolledCourses.length > 0 && (
              <button 
                onClick={clearAllEnrollments}
                className={`ml-3 px-2 py-1 rounded-md text-sm ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-5 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span>{isEditing ? '✏️' : '➕'}</span>
              {isEditing ? 'Update Enrollment' : 'Enroll in a Course'}
            </h2>

            <div className="space-y-4">
              {/* Course Selection */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📖 Select Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={handleCourseSelect}
                  disabled={isEditing}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  {coursesList.map(course => (
                    <option key={course._id.$oid} value={course._id.$oid}>
                      {course.thumbnail} {course.title} ({course.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📌 Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., UI/UX Design Mastery"
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📝 Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Course description..."
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              {/* Two column row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    👩‍🏫 Instructor
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    🎨 Thumbnail Emoji
                  </label>
                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    maxLength="2"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Two column row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📂 Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ⚡ Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ⏱️ Duration (hours)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEnroll}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {isEditing ? '✅ Update Enrollment' : '📥 Enroll Now'}
                </button>
                {isEditing && (
                  <button
                    onClick={cancelEdit}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Enrolled Courses List */}
          <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-5 flex items-center justify-between ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="flex items-center gap-2">📋 My Enrolled Courses</span>
              <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                Auto-saved ✓
              </span>
            </h2>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No enrollments yet</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Use the form on the left to enroll in courses
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scroll">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.enrollmentId}
                    className={`p-4 rounded-lg border transition cursor-pointer ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-gray-50 border-gray-200 hover:shadow-md'}`}
                    onClick={() => router.push(`/dashboard/student/courses/${course.enrollmentId}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-3xl">{course.thumbnail || '📘'}</div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(course)}
                          className={`px-2 py-1 rounded text-sm transition ${darkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.enrollmentId)}
                          className={`px-2 py-1 rounded text-sm transition ${darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    
                    <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {course.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        👩‍🏫 {course.instructor}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        📂 {course.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        ⚡ {course.level}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        ⏱️ {course.duration}h
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {course.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs pt-2 border-t mt-2 border-gray-200 dark:border-gray-600">
                      <span className={`px-2 py-1 rounded ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                        📖 {getLessonSummary(course.lessons)}
                      </span>
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                        📅 {new Date(course.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#e2e8f0'};
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#6366f1' : '#3b82f6'};
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}