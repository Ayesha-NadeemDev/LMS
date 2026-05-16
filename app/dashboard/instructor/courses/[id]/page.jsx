"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Users,
  Star,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  PlayCircle,
  Upload,
  Loader2
} from 'lucide-react';

const CourseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    level: '',
    category: ''
  });
  
  // Sections and Lessons state
  const [sections, setSections] = useState([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddLesson, setShowAddLesson] = useState(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'video',
    content: '',
    duration: ''
  });

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch course data
  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`/api/instructor/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCourse(data.course);
        setSections(data.course.sections || []);
        setEditForm({
          title: data.course.title || '',
          description: data.course.description || '',
          price: data.course.price || '',
          duration: data.course.duration || '',
          level: data.course.level || 'Beginner',
          category: data.course.category || 'Development'
        });
      } else {
        showToast(data.error || 'Failed to load course', 'error');
      }
    } catch (error) {
      console.error('Fetch course error:', error);
      showToast('Failed to load course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update course
  const handleUpdateCourse = async () => {
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Course updated successfully!', 'success');
        setIsEditing(false);
        await fetchCourse();
      } else {
        showToast(data.error || 'Failed to update course', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Add new section
  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      showToast('Please enter section title', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/instructor/courses/${courseId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newSectionTitle })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Section added successfully!', 'success');
        setNewSectionTitle('');
        setShowAddSection(false);
        await fetchCourse();
      } else {
        showToast(data.error || 'Failed to add section', 'error');
      }
    } catch (error) {
      console.error('Add section error:', error);
      showToast('Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Add lesson to section
  const handleAddLesson = async (sectionId) => {
    if (!newLesson.title.trim()) {
      showToast('Please enter lesson title', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/instructor/courses/${courseId}/sections/${sectionId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLesson)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Lesson added successfully!', 'success');
        setNewLesson({
          title: '',
          type: 'video',
          content: '',
          duration: ''
        });
        setShowAddLesson(null);
        await fetchCourse();
      } else {
        showToast(data.error || 'Failed to add lesson', 'error');
      }
    } catch (error) {
      console.error('Add lesson error:', error);
      showToast('Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete section
  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section and all its lessons?')) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/instructor/courses/${courseId}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Section deleted successfully!', 'success');
        await fetchCourse();
      } else {
        showToast(data.error || 'Failed to delete section', 'error');
      }
    } catch (error) {
      console.error('Delete section error:', error);
      showToast('Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (sectionId, lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Lesson deleted successfully!', 'success');
        await fetchCourse();
      } else {
        showToast(data.error || 'Failed to delete lesson', 'error');
      }
    } catch (error) {
      console.error('Delete lesson error:', error);
      showToast('Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Course not found</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm"
            style={{ backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444' }}
          >
            {toastMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Course' : course.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Manage course content and settings
                </p>
              </div>
            </div>
            <button
              onClick={() => isEditing ? handleUpdateCourse() : setIsEditing(true)}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                <Save className="w-4 h-4" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
              {isEditing ? 'Save Changes' : 'Edit Course'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {['overview', 'curriculum', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {isEditing ? (
              // Edit Mode
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={editForm.duration}
                        onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., 40 hours"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Level
                      </label>
                      <select
                        value={editForm.level}
                        onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option>Development</option>
                        <option>Data Science</option>
                        <option>Design</option>
                        <option>Marketing</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                {/* Course Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Course Description</h3>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{course.description}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Price</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${course.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Duration</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{course.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Level</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Category</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{course.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'published' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {course.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{course.students || 0}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{course.rating || 0}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{sections.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Sections</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Video className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {sections.reduce((total, section) => total + (section.lessons?.length || 0), 0)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Lessons</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Curriculum Tab */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4">
            {/* Add Section Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Curriculum</h2>
              <button
                onClick={() => setShowAddSection(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {/* Sections List */}
            {sections.map((section, index) => (
              <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({section.lessons?.length || 0} lessons)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddLesson(showAddLesson === section.id ? null : section.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      disabled={submitting}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {section.lessons?.map((lesson) => (
                    <div key={lesson.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        {lesson.type === 'video' ? (
                          <Video className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{lesson.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(section.id, lesson.id)}
                        disabled={submitting}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Lesson Form */}
                {showAddLesson === section.id && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Lesson Title"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={newLesson.type}
                          onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="video">Video</option>
                          <option value="document">Document</option>
                          <option value="quiz">Quiz</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Duration (e.g., 10:30)"
                          value={newLesson.duration}
                          onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <textarea
                        placeholder="Content URL or Description"
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowAddLesson(null)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddLesson(section.id)}
                          disabled={submitting}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          {submitting ? 'Adding...' : 'Add Lesson'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Section Modal */}
            <AnimatePresence>
              {showAddSection && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowAddSection(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Section</h3>
                    <input
                      type="text"
                      placeholder="Section Title"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowAddSection(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSection}
                        disabled={submitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        {submitting ? 'Adding...' : 'Add Section'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Enrollment Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total Enrollments</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{course.students || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Completion Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{course.completionRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Average Rating</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{course.rating || 0} / 5</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total Revenue</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${course.revenue || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Average per Student</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${course.students ? (course.revenue / course.students).toFixed(2) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;