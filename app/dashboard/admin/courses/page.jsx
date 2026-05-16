"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Filter, Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle, Clock,
  DollarSign, Users, Star, TrendingUp, RefreshCw, X, Check, AlertCircle, ChevronLeft, ChevronRight,
  Upload, Image as ImageIcon, Tag, Calendar, BarChart2, MessageSquare, Award, PlayCircle,
  FileText, Grid, List, Download, Copy, ExternalLink
} from 'lucide-react';

const AdminCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [itemsPerPage] = useState(9);
  
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', level: 'Beginner', price: 0,
    duration: '', instructor: '', thumbnail: '', status: 'pending',
    featured: false, lessons: 0, quizzes: 0, resources: 0
  });

  // Sample initial data for courses
  const initialCourses = [
    {
      id: 1, title: 'Web Development Bootcamp',
      description: 'Complete web development course from zero to hero.',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=240&fit=crop',
      category: 'Development', level: 'Beginner to Advanced', price: 49.99, duration: '40 hours',
      instructor: 'Dr. Sarah Johnson', instructorId: 1,
      instructorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff',
      status: 'published', featured: true, students: 1247, rating: 4.8, ratingCount: 892,
      lessons: 48, quizzes: 12, resources: 24, enrollmentDate: '2024-01-15', lastUpdated: '2024-03-10',
      revenue: 24940, completionRate: 72
    },
    {
      id: 2, title: 'Data Science Fundamentals',
      description: 'Master data analysis, visualization, and machine learning with Python.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop',
      category: 'Data Science', level: 'Intermediate', price: 59.99, duration: '35 hours',
      instructor: 'Prof. Michael Chen', instructorId: 2,
      instructorAvatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff',
      status: 'published', featured: false, students: 856, rating: 4.7, ratingCount: 634,
      lessons: 42, quizzes: 10, resources: 18, enrollmentDate: '2024-02-01', lastUpdated: '2024-03-05',
      revenue: 17120, completionRate: 68
    },
    {
      id: 3, title: 'UI/UX Design Mastery',
      description: 'Learn user-centered design principles, prototyping, and design tools.',
      thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=240&fit=crop',
      category: 'Design', level: 'All Levels', price: 39.99, duration: '28 hours',
      instructor: 'Lisa Anderson', instructorId: 3,
      instructorAvatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=8b5cf6&color=fff',
      status: 'pending', featured: false, students: 0, rating: 0, ratingCount: 0,
      lessons: 36, quizzes: 8, resources: 32, enrollmentDate: '2024-03-10', lastUpdated: '2024-03-12',
      revenue: 0, completionRate: 0
    },
    {
      id: 4, title: 'Mobile App Development',
      description: 'Build iOS and Android apps with React Native and Expo.',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=240&fit=crop',
      category: 'Development', level: 'Intermediate', price: 54.99, duration: '38 hours',
      instructor: 'Robert Taylor', instructorId: 4,
      instructorAvatar: 'https://ui-avatars.com/api/?name=Robert+Taylor&background=ef4444&color=fff',
      status: 'suspended', featured: false, students: 523, rating: 4.6, ratingCount: 412,
      lessons: 44, quizzes: 9, resources: 20, enrollmentDate: '2024-02-15', lastUpdated: '2024-03-08',
      revenue: 10460, completionRate: 58
    },
    {
      id: 5, title: 'Cloud Computing with AWS',
      description: 'Master AWS services, cloud architecture, and DevOps practices.',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=240&fit=crop',
      category: 'Cloud', level: 'Advanced', price: 69.99, duration: '45 hours',
      instructor: 'Emma Watson', instructorId: 5,
      instructorAvatar: 'https://ui-avatars.com/api/?name=Emma+Watson&background=f59e0b&color=fff',
      status: 'published', featured: true, students: 678, rating: 4.8, ratingCount: 534,
      lessons: 52, quizzes: 14, resources: 28, enrollmentDate: '2024-01-20', lastUpdated: '2024-03-01',
      revenue: 20340, completionRate: 71
    },
    {
      id: 6, title: 'Digital Marketing Strategy',
      description: 'Complete digital marketing course covering SEO, social media, email marketing.',
      thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=240&fit=crop',
      category: 'Marketing', level: 'Beginner', price: 44.99, duration: '30 hours',
      instructor: 'David Kim', instructorId: 6,
      instructorAvatar: 'https://ui-avatars.com/api/?name=David+Kim&background=3b82f6&color=fff',
      status: 'pending', featured: false, students: 0, rating: 0, ratingCount: 0,
      lessons: 38, quizzes: 11, resources: 26, enrollmentDate: '2024-03-05', lastUpdated: '2024-03-14',
      revenue: 0, completionRate: 0
    },
    {
      id: 7, title: 'Python for Beginners',
      description: 'Learn Python programming from scratch.',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=240&fit=crop',
      category: 'Development', level: 'Beginner', price: 29.99, duration: '25 hours',
      instructor: 'Dr. Sarah Johnson', instructorId: 1,
      instructorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff',
      status: 'published', featured: false, students: 2341, rating: 4.9, ratingCount: 1892,
      lessons: 32, quizzes: 8, resources: 16, enrollmentDate: '2024-01-10', lastUpdated: '2024-03-12',
      revenue: 46780, completionRate: 85
    },
    {
      id: 8, title: 'Machine Learning A-Z',
      description: 'Learn to create Machine Learning algorithms in Python.',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=240&fit=crop',
      category: 'Data Science', level: 'Advanced', price: 79.99, duration: '50 hours',
      instructor: 'Prof. Michael Chen', instructorId: 2,
      instructorAvatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff',
      status: 'pending', featured: false, students: 0, rating: 0, ratingCount: 0,
      lessons: 60, quizzes: 15, resources: 35, enrollmentDate: '2024-03-08', lastUpdated: '2024-03-13',
      revenue: 0, completionRate: 0
    },
    {
      id: 9, title: 'Blockchain Fundamentals',
      description: 'Understand blockchain technology and build your first smart contract.',
      thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=240&fit=crop',
      category: 'Blockchain', level: 'Intermediate', price: 64.99, duration: '32 hours',
      instructor: 'Emma Watson', instructorId: 5,
      instructorAvatar: 'https://ui-avatars.com/api/?name=Emma+Watson&background=f59e0b&color=fff',
      status: 'published', featured: true, students: 456, rating: 4.7, ratingCount: 324,
      lessons: 40, quizzes: 10, resources: 22, enrollmentDate: '2024-02-05', lastUpdated: '2024-03-09',
      revenue: 12870, completionRate: 64
    }
  ];

  const categories = ['all', 'Development', 'Data Science', 'Design', 'Cloud', 'Marketing', 'Blockchain'];

  // ✅ Load from localStorage on mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('admin_courses');
    if (savedCourses && JSON.parse(savedCourses).length > 0) {
      setCourses(JSON.parse(savedCourses));
      setLoading(false);
    } else {
      loadCourses();
    }
  }, []);

  // ✅ Save to localStorage whenever courses change
  useEffect(() => {
    if (courses.length > 0 && !loading) {
      localStorage.setItem('admin_courses', JSON.stringify(courses));
    }
  }, [courses, loading]);

  const loadCourses = () => {
    setLoading(true);
    setTimeout(() => {
      setCourses(initialCourses);
      setLoading(false);
    }, 500);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || course.status === selectedFilter;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // ✅ FIXED: Add Course with localStorage
  const handleAddCourse = () => {
    if (!formData.title || !formData.description || !formData.category || !formData.instructor) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const newCourse = {
      id: Date.now(),
      ...formData,
      thumbnail: formData.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.title)}&background=6366f1&color=fff&size=400x240`,
      students: 0, rating: 0, ratingCount: 0, revenue: 0, completionRate: 0,
      enrollmentDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      instructorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.instructor)}&background=6366f1&color=fff`
    };
    const updatedCourses = [newCourse, ...courses];
    setCourses(updatedCourses);
    localStorage.setItem('admin_courses', JSON.stringify(updatedCourses));
    setShowModal(false);
    resetForm();
    showToast('Course added successfully!', 'success');
  };

  // ✅ FIXED: Edit Course with localStorage
  const handleEditCourse = () => {
    if (!formData.title || !formData.description) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const updatedCourses = courses.map(c => 
      c.id === selectedCourse.id ? { ...c, ...formData, lastUpdated: new Date().toISOString().split('T')[0] } : c
    );
    setCourses(updatedCourses);
    localStorage.setItem('admin_courses', JSON.stringify(updatedCourses));
    setShowModal(false);
    resetForm();
    showToast('Course updated successfully!', 'success');
  };

  const updateStatus = (id, newStatus) => {
    const updatedCourses = courses.map(c => c.id === id ? { ...c, status: newStatus } : c);
    setCourses(updatedCourses);
    localStorage.setItem('admin_courses', JSON.stringify(updatedCourses));
    showToast(`Course ${newStatus === 'published' ? 'published' : newStatus === 'suspended' ? 'suspended' : 'status updated'}!`, 'success');
  };

  const toggleFeatured = (id) => {
    const updatedCourses = courses.map(c => c.id === id ? { ...c, featured: !c.featured } : c);
    setCourses(updatedCourses);
    localStorage.setItem('admin_courses', JSON.stringify(updatedCourses));
    showToast('Featured status updated!', 'success');
  };

  const handleDeleteCourse = (id) => {
    const updatedCourses = courses.filter(c => c.id !== id);
    setCourses(updatedCourses);
    localStorage.setItem('admin_courses', JSON.stringify(updatedCourses));
    setDeleteConfirm(null);
    showToast('Course deleted successfully!', 'success');
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', category: '', level: 'Beginner', price: 0,
      duration: '', instructor: '', thumbnail: '', status: 'pending',
      featured: false, lessons: 0, quizzes: 0, resources: 0
    });
    setSelectedCourse(null);
  };

  const openModal = (mode, course = null) => {
    setModalMode(mode);
    if (course) {
      setSelectedCourse(course);
      setFormData({
        title: course.title, description: course.description, category: course.category,
        level: course.level, price: course.price, duration: course.duration,
        instructor: course.instructor, thumbnail: course.thumbnail, status: course.status,
        featured: course.featured, lessons: course.lessons, quizzes: course.quizzes, resources: course.resources
      });
    } else { resetForm(); }
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published': return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Published' };
      case 'pending': return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'Pending' };
      case 'suspended': return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Suspended' };
      default: return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: Clock, label: status };
    }
  };

  const stats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Published', value: courses.filter(c => c.status === 'published').length, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending Review', value: courses.filter(c => c.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Total Revenue', value: `$${courses.reduce((acc, c) => acc + c.revenue, 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' }
  ];

  const CourseCard = ({ course }) => {
    const statusBadge = getStatusBadge(course.status);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
      >
        <div className="relative h-40 overflow-hidden">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${statusBadge.color}`}>
              {React.createElement(statusBadge.icon, { className: "w-3 h-3" })}
              {statusBadge.label}
            </span>
          </div>
          {course.featured && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded-lg text-xs">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{course.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{course.description}</p>
          <div className="flex items-center gap-2 mb-3">
            <img src={course.instructorAvatar} alt={course.instructor} className="w-5 h-5 rounded-full" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{course.instructor}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400 dark:text-gray-500" /><span className="text-xs text-gray-600 dark:text-gray-400">{course.students.toLocaleString()}</span></div>
            <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-current" /><span className="text-xs text-gray-600 dark:text-gray-400">{course.rating || 'N/A'}</span></div>
            <div className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-green-500" /><span className="text-xs font-semibold text-green-600 dark:text-green-400">${course.price}</span></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openModal('view', course)} className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">View Details</button>
            <button onClick={() => openModal('edit', course)} className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Edit</button>
          </div>
        </div>
      </motion.div>
    );
  };

  const CourseRow = ({ course }) => {
    const statusBadge = getStatusBadge(course.status);
    return (
      <motion.tr
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
            <div><p className="font-medium text-gray-900 dark:text-white">{course.title}</p><p className="text-xs text-gray-500 dark:text-gray-400">{course.instructor}</p></div>
          </div>
        </td>
        <td className="py-3 px-4"><span className="text-sm text-gray-700 dark:text-gray-300">{course.category}</span></td>
        <td className="py-3 px-4"><div className="flex items-center gap-1"><Users className="w-4 h-4 text-gray-400 dark:text-gray-500" /><span className="text-sm text-gray-900 dark:text-white">{course.students.toLocaleString()}</span></div></td>
        <td className="py-3 px-4"><div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-green-500" /><span className="text-sm font-medium text-green-600 dark:text-green-400">${course.price}</span></div></td>
        <td className="py-3 px-4"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /><span className="text-sm text-gray-900 dark:text-white">{course.rating || 'N/A'}</span></div></td>
        <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>{React.createElement(statusBadge.icon, { className: "w-3 h-3" })}{statusBadge.label}</span></td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button onClick={() => openModal('view', course)} className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Eye className="w-4 h-4" /></button>
            <button onClick={() => openModal('edit', course)} className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><Edit className="w-4 h-4" /></button>
            {course.status === 'pending' && <button onClick={() => updateStatus(course.id, 'published')} className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"><CheckCircle className="w-4 h-4" /></button>}
            {course.status === 'published' && <button onClick={() => updateStatus(course.id, 'suspended')} className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><XCircle className="w-4 h-4" /></button>}
            <button onClick={() => setDeleteConfirm({ id: course.id, name: course.title })} className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        </td>
      </motion.tr>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Course</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteConfirm.name}</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
                <button onClick={() => handleDeleteCourse(deleteConfirm.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit/View Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalMode === 'add' && 'Add New Course'}
                  {modalMode === 'edit' && 'Edit Course'}
                  {modalMode === 'view' && 'Course Details'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="p-6">
                {modalMode === 'view' && selectedCourse ? (
                  <div className="space-y-6">
                    {/* View mode content - keep as is */}
                    <div className="flex gap-4">
                      <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-32 h-32 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCourse.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedCourse.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${getStatusBadge(selectedCourse.status).color}`}>
                            {React.createElement(getStatusBadge(selectedCourse.status).icon, { className: "w-3 h-3" })}
                            {getStatusBadge(selectedCourse.status).label}
                          </span>
                          {selectedCourse.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedCourse.students.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Enrolled Students</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                        <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedCourse.rating || 'N/A'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">${selectedCourse.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedCourse.completionRate}%</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Add/Edit Form
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title *</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter course title" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                      <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter course description" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                        <option value="">Select Category</option>
                        {categories.filter(c => c !== 'all').map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                      <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                        <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option><option value="All Levels">All Levels</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                      <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                      <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 40 hours" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor *</label>
                      <input type="text" value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Instructor name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                        <option value="pending">Pending</option><option value="published">Published</option><option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                      <input type="text" value={formData.thumbnail} onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="https://example.com/image.jpg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lessons Count</label>
                      <input type="number" value={formData.lessons} onChange={(e) => setFormData({...formData, lessons: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quizzes Count</label>
                      <input type="number" value={formData.quizzes} onChange={(e) => setFormData({...formData, quizzes: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0" />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Featured Course</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
                {modalMode !== 'view' && (
                  <>
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
                    <button onClick={modalMode === 'add' ? handleAddCourse : handleEditCourse} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      {modalMode === 'add' ? 'Add Course' : 'Save Changes'}
                    </button>
                  </>
                )}
                {modalMode === 'view' && (
                  <div className="flex gap-3 w-full">
                    <button onClick={() => setModalMode('edit')} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Edit Course</button>
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Close</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all courses, approve submissions, and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p></div>
                <div className={`${stat.color} p-3 rounded-full`}><stat.icon className="w-6 h-6 text-white" /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input type="text" placeholder="Search by title, description, or instructor..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                {categories.map(cat => (<option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>))}
              </select>
              <select value={selectedFilter} onChange={(e) => { setSelectedFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                <option value="all">All Status</option><option value="published">Published</option><option value="pending">Pending</option><option value="suspended">Suspended</option>
              </select>
              <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}><List className="w-4 h-4" /></button>
              </div>
              <button onClick={() => openModal('add')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Course</button>
              <button onClick={loadCourses} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"><RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} /></button>
            </div>
          </div>
        </div>

        {/* Courses Display */}
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white dark:bg-gray-800 rounded-xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl"><BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-500 dark:text-gray-400">No courses found</p><button onClick={() => openModal('add')} className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Add your first course</button></div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"><AnimatePresence>{paginatedCourses.map(course => <CourseCard key={course.id} course={course} />)}</AnimatePresence></div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Course</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Category</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Students</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Price</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Rating</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th></tr>
              </thead>
              <tbody><AnimatePresence>{paginatedCourses.map(course => <CourseRow key={course.id} course={course} />)}</AnimatePresence></tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredCourses.length > 0 && (
          <div className="flex justify-between items-center mt-6 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
              <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"><ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseManagement;