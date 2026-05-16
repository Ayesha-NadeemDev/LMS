"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Filter,
  Mail, 
  MessageSquare, 
  BarChart2, 
  UserCheck, 
  UserX,
  Star,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Clock,
  Award,
  BookOpen,
  X,
  Send,
  Download,
  TrendingUp,
  Calendar,
  Eye,
  UserPlus,
  Loader2
} from 'lucide-react';

const InstructorStudentsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    atRiskStudents: 0,
    averageProgress: 0
  });
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [addStudentForm, setAddStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    courseId: ''
  });
  const [addingStudent, setAddingStudent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(null);

  const filters = [
    { value: 'all', label: 'All Students', icon: Users },
    { value: 'active', label: 'Active', icon: UserCheck },
    { value: 'at-risk', label: 'At Risk', icon: UserX },
    { value: 'excellent', label: 'Top Performers', icon: Award }
  ];

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/instructor/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load students');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/instructor/courses/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableCourses(data.courses);
        if (data.courses.length > 0) {
          setAddStudentForm(prev => ({ ...prev, courseId: data.courses[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/instructor/students/${showMessageModal}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });
      const data = await response.json();

      if (data.success) {
        showToast('Message sent successfully!', 'success');
        setShowMessageModal(null);
        setMessageText('');
      } else {
        showToast(data.error || 'Failed to send message', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!addStudentForm.name || !addStudentForm.email || !addStudentForm.courseId) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    setAddingStudent(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/instructor/courses/${addStudentForm.courseId}/add-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addStudentForm.name,
          email: addStudentForm.email,
          password: addStudentForm.password || 'student123'
        })
      });
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'success');
        setShowAddStudentModal(false);
        setAddStudentForm({ name: '', email: '', password: '', courseId: availableCourses[0]?.id || '' });
        fetchStudents();
      } else {
        showToast(data.error || 'Failed to add student', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleViewProgress = async (student) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/instructor/students/${student.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setShowProgressModal(data);
      } else {
        showToast(data.error || 'Failed to load progress', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleExportData = () => {
    const exportData = students.map(s => ({
      name: s.name,
      email: s.email,
      course: s.course,
      progress: `${s.progress}%`,
      grade: s.grade,
      attendance: `${s.attendance}%`,
      status: s.status,
      lastActive: s.lastActive,
      enrollmentDate: s.enrollmentDate
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    
    if (selectedFilter === 'active') {
      matchesFilter = student.status === 'active';
    } else if (selectedFilter === 'at-risk') {
      matchesFilter = student.status === 'at-risk';
    } else if (selectedFilter === 'excellent') {
      matchesFilter = student.performance === 'excellent';
    }
    
    return matchesSearch && matchesFilter;
  });

  const getProgressColor = (progress) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'at-risk': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button onClick={fetchStudents} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
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

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
              <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">View and track your enrolled students</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Add New Student
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalStudents}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Enrolled in your courses</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Active Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeStudents}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Engaged learners</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">At Risk</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.atRiskStudents}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Need attention</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Average Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.averageProgress}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Across all courses</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    selectedFilter === filter.value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200"
              onMouseEnter={() => setHoveredStudent(student.id)}
              onMouseLeave={() => setHoveredStudent(null)}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=6366f1&color=fff`}
                      alt={student.name}
                      className="w-16 h-16 rounded-full border-2 border-indigo-200 dark:border-indigo-800"
                    />
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                      {student.performance === 'excellent' && (
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                        {student.status === 'active' ? 'Active' : 'At Risk'}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{student.email}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <GraduationCap className="w-4 h-4" />
                        {student.course}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        Last active: {new Date(student.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="min-w-[200px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Lessons: {student.completedAssignments || 0}/{student.totalAssignments || 15}</span>
                      <span>Grade: {student.grade}</span>
                      <span>Attendance: {student.attendance}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMessageModal(student.id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Send Message"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleViewProgress(student)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="View Progress Details"
                    >
                      <BarChart2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {expandedStudent === student.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedStudent === student.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Course Progress
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Assignments</span>
                                <span className="font-medium text-gray-900 dark:text-white">{student.completedAssignments || 0}/{student.totalAssignments || 15}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${((student.completedAssignments || 0) / (student.totalAssignments || 15)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setShowMessageModal(student.id)}
                              className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900 transition"
                            >
                              Send Reminder
                            </button>
                            <button
                              onClick={() => handleViewProgress(student)}
                              className="px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900 transition"
                            >
                              View Full Report
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No students found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMessageModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send Message</h2>
                <button onClick={() => setShowMessageModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  rows="5"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 justify-end p-6 pt-0">
                <button onClick={() => setShowMessageModal(null)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button onClick={handleSendMessage} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Details Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowProgressModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Details</h2>
                <button onClick={() => setShowProgressModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={showProgressModal.student?.avatar || `https://ui-avatars.com/api/?name=${showProgressModal.student?.name}&background=6366f1&color=fff`}
                    alt={showProgressModal.student?.name}
                    className="w-16 h-16 rounded-full border-2 border-indigo-200 dark:border-indigo-800"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{showProgressModal.student?.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{showProgressModal.student?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{showProgressModal.stats?.averageProgress || 0}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{showProgressModal.stats?.completedLessons || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lessons Done</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{showProgressModal.stats?.totalLessons || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{showProgressModal.stats?.certificatesEarned || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Course-wise Progress</h4>
                <div className="space-y-3">
                  {showProgressModal.student?.enrolledCourses?.map((course, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{course.title}</span>
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Grade: {course.grade}</span>
                        <span>Lessons: {course.completedLessons}/{course.totalLessons}</span>
                        <span>Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 pt-0 flex justify-end">
                <button onClick={() => setShowProgressModal(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddStudentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !addingStudent && setShowAddStudentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Student</h2>
                <button onClick={() => setShowAddStudentModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={addStudentForm.name}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={addStudentForm.email}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="student@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={addStudentForm.password}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Leave empty for auto-generated"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default password: student123</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Course *
                  </label>
                  <select
                    value={addStudentForm.courseId}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, courseId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {availableCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.enrolledCount || 0} students)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    type="button" 
                    onClick={() => setShowAddStudentModal(false)} 
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={addingStudent}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {addingStudent ? 'Adding...' : 'Add Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorStudentsPage;