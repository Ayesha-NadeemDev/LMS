"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  Award
} from 'lucide-react';

const AdminStudentManagement = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    status: 'active',
    grade: '',
    progress: 0,
    password: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [itemsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    averageProgress: 0
  });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, selectedFilter, currentPage]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`/api/admin/users?role=student&search=${searchTerm}&status=${selectedFilter}&page=${currentPage}&limit=${itemsPerPage}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setStudents(data.users);
        setTotalStudents(data.total);
        
        const activeCount = data.users.filter(u => u.status === 'Active').length;
        const suspendedCount = data.users.filter(u => u.status === 'Suspended').length;
        const avgProgress = data.users.length > 0 
          ? Math.round(data.users.reduce((sum, u) => sum + (u.stats?.progress || 0), 0) / data.users.length)
          : 0;
        
        setStats({
          total: data.total,
          active: activeCount,
          suspended: suspendedCount,
          averageProgress: avgProgress
        });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!formData.name || !formData.email || !formData.course) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || 'student123',
          role: 'student'
        })
      });
      const data = await response.json();

      if (data.success) {
        showToast('Student added successfully!', 'success');
        setShowModal(false);
        resetForm();
        fetchStudents();
      } else {
        showToast(data.error || 'Failed to add student', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleEditStudent = async () => {
    if (!formData.name || !formData.email) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          status: formData.status
        })
      });
      const data = await response.json();

      if (data.success) {
        showToast('Student updated successfully!', 'success');
        setShowModal(false);
        resetForm();
        fetchStudents();
      } else {
        showToast(data.error || 'Failed to update student', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        showToast('Student deleted successfully!', 'success');
        setDeleteConfirm(null);
        fetchStudents();
      } else {
        showToast(data.error || 'Failed to delete student', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (data.success) {
        showToast(`Student ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`, 'success');
        fetchStudents();
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      course: '',
      status: 'active',
      grade: '',
      progress: 0,
      password: ''
    });
    setSelectedStudent(null);
  };

  const openModal = (mode, student = null) => {
    setModalMode(mode);
    if (student) {
      setSelectedStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        course: student.course,
        status: student.status.toLowerCase(),
        grade: student.grade || '',
        progress: student.progress || 0,
        password: ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };
  {/* Add/Edit/View Modal */}
<AnimatePresence>
  {showModal && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {modalMode === 'add' && 'Add New Student'}
            {modalMode === 'edit' && 'Edit Student'}
            {modalMode === 'view' && 'Student Details'}
          </h2>
          <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto custom-scrollbar">
          {modalMode === 'view' && selectedStudent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedStudent.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedStudent.email}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusBadge(selectedStudent.status)}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div><p className="text-gray-500 dark:text-gray-400 text-sm">Course</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.course}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-sm">Grade</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.grade || 'N/A'}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-sm">Progress</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.progress || 0}%</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-sm">Joined</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.joined}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-sm">Enrollments</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.stats?.enrollments || 0}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-sm">Certificates</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.stats?.certificates || 0}</p></div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
                  placeholder="Enter student name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
                  placeholder="student@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
                <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select Course</option>
                  <option value="Web Development Bootcamp">Web Development Bootcamp</option>
                  <option value="Data Science Fundamentals">Data Science Fundamentals</option>
                  <option value="UI/UX Design Mastery">UI/UX Design Mastery</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                </select>
              </div>
              {modalMode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
                    placeholder="Leave empty for auto-generated" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default: student123</p>
                </div>
              )}
              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {modalMode !== 'view' && (
            <>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={modalMode === 'add' ? handleAddStudent : handleEditStudent}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {modalMode === 'add' ? 'Add Student' : 'Save Changes'}
              </button>
            </>
          )}
          {modalMode === 'view' && (
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Close</button>
          )}
        </div>
      </div>
    </div>
  )}
</AnimatePresence>

  const getStatusBadge = (status) => {
    if (status === 'Active' || status === 'active') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalPages = Math.ceil(totalStudents / itemsPerPage);

  const statsCards = [
    { label: 'Total Students', value: stats.total, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Students', value: stats.active, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Suspended', value: stats.suspended, icon: UserX, color: 'bg-red-500' },
    { label: 'Avg. Progress', value: `${stats.averageProgress}%`, icon: Award, color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Student</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteConfirm.name}</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
                <button onClick={() => handleDeleteStudent(deleteConfirm.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit/View Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalMode === 'add' && 'Add New Student'}
                  {modalMode === 'edit' && 'Edit Student'}
                  {modalMode === 'view' && 'Student Details'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-500 dark:text-gray-400" /></button>
              </div>
              
              <div className="p-6 space-y-4">
                {modalMode === 'view' && selectedStudent ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {selectedStudent.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{selectedStudent.email}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusBadge(selectedStudent.status)}`}>
                          {selectedStudent.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div><p className="text-gray-500 dark:text-gray-400 text-sm">Course</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.course}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400 text-sm">Grade</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.grade || 'N/A'}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400 text-sm">Progress</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.progress || 0}%</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400 text-sm">Joined</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.joined}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400 text-sm">Enrollments</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.stats?.enrollments || 0}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400 text-sm">Certificates</p><p className="font-medium text-gray-900 dark:text-white">{selectedStudent.stats?.certificates || 0}</p></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="Enter student name" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="student@example.com" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
                      <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                        <option value="">Select Course</option>
                        <option value="Web Development Bootcamp">Web Development Bootcamp</option>
                        <option value="Data Science Fundamentals">Data Science Fundamentals</option>
                        <option value="UI/UX Design Mastery">UI/UX Design Mastery</option>
                        <option value="Mobile App Development">Mobile App Development</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                      </select>
                    </div>
                    {modalMode === 'add' && (
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="Leave empty for auto-generated" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default: student123</p>
                      </div>
                    )}
                    {modalMode === 'edit' && (
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                          <option value="active">Active</option><option value="suspended">Suspended</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                {modalMode !== 'view' && (
                  <>
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
                    <button onClick={modalMode === 'add' ? handleAddStudent : handleEditStudent}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      {modalMode === 'add' ? 'Add Student' : 'Save Changes'}
                    </button>
                  </>
                )}
                {modalMode === 'view' && (
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Close</button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all students, track progress, and control access</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat) => (
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search by name or email..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400" />
            </div>
            <div className="flex gap-2">
              <select value={selectedFilter} onChange={(e) => { setSelectedFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                <option value="all">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option>
              </select>
              <button onClick={() => openModal('add')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Student
              </button>
              <button onClick={fetchStudents} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Course</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Progress</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Last Active</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {student.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{student.course || 'Multiple Courses'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">{student.progress || 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full ${getProgressColor(student.progress || 0)} transition-all duration-500`} style={{ width: `${student.progress || 0}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadge(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{student.lastActive || student.joined}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openModal('view', student)} className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button onClick={() => openModal('edit', student)} className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => toggleStatus(student.id, student.status.toLowerCase())} 
                              className={`p-1 rounded-lg transition ${student.status === 'Active' ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'}`}>
                              {student.status === 'Active' ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                            </button>
                            <button onClick={() => setDeleteConfirm({ id: student.id, name: student.name })} className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {students.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No students found</p>
                  <button onClick={() => openModal('add')} className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Add your first student</button>
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Showing {(currentPage-1)*itemsPerPage+1} to {Math.min(currentPage*itemsPerPage, totalStudents)} of {totalStudents} students</p>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudentManagement;