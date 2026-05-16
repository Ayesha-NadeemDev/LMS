"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, X, UserPlus, BookOpen, Mail, Phone, MapPin, Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInstructorPage() {
  const router = useRouter();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [toastMessage, setToastMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'instructor'
  });
  const [adding, setAdding] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalCourses: 0,
    totalStudents: 0
  });

  const perPage = 6;

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchInstructors();
  }, [search, page]);

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`/api/admin/users?role=instructor&search=${search}&page=${page}&limit=${perPage}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setInstructors(data.users);
        const active = data.users.filter(u => u.status === 'Active').length;
        setStats({
          total: data.total,
          active: active,
          totalCourses: data.users.reduce((sum, u) => sum + (u.stats?.courses || 0), 0),
          totalStudents: data.users.reduce((sum, u) => sum + (u.stats?.students || 0), 0)
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Instructor
  const handleAddInstructor = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email) {
      showToast('Please fill name and email', 'error');
      return;
    }

    setAdding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addForm.name,
          email: addForm.email,
          password: addForm.password || 'instructor123',
          role: 'instructor'
        })
      });
      const data = await response.json();

      if (data.success) {
        showToast('Instructor added successfully!', 'success');
        setShowAddModal(false);
        setAddForm({ name: '', email: '', password: '', role: 'instructor' });
        fetchInstructors();
      } else {
        showToast(data.error || 'Failed to add instructor', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleViewInstructor = async (instructor) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${instructor.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedInstructor(data.user);
        setModalMode('view');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteInstructor = async (instructorId, instructorName) => {
    if (!confirm(`Are you sure you want to delete instructor "${instructorName}"? This will delete all their courses.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${instructorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        showToast('Instructor deleted successfully!', 'success');
        fetchInstructors();
      } else {
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  const totalPages = Math.ceil(stats.total / perPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto mt-6">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm"
            style={{ backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444' }}
          >
            {toastMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Instructor Management</h1>
          <p className="text-gray-500 mt-1">Manage all instructors on the platform</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Instructor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Total Instructors</p><p className="text-2xl font-bold">{stats.total}</p></div>
            <div className="bg-indigo-100 p-3 rounded-full"><BookOpen className="w-6 h-6 text-indigo-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Active Instructors</p><p className="text-2xl font-bold">{stats.active}</p></div>
            <div className="bg-green-100 p-3 rounded-full"><UserPlus className="w-6 h-6 text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Total Courses</p><p className="text-2xl font-bold">{stats.totalCourses}</p></div>
            <div className="bg-purple-100 p-3 rounded-full"><BookOpen className="w-6 h-6 text-purple-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Total Students</p><p className="text-2xl font-bold">{stats.totalStudents}</p></div>
            <div className="bg-yellow-100 p-3 rounded-full"><BookOpen className="w-6 h-6 text-yellow-600" /></div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="p-5 border-b">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instructors by name or email..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Instructors Grid */}
        <div className="p-5">
          {instructors.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No instructors found</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {instructors.map((instructor) => (
                <div key={instructor.id} className="border rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {instructor.name?.charAt(0) || 'I'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{instructor.name}</h3>
                        <p className="text-sm text-gray-500">{instructor.email}</p>
                        <Badge variant="info" className="mt-1">Instructor</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleViewInstructor(instructor)} className="p-1.5 rounded hover:bg-gray-100" title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDeleteInstructor(instructor.id, instructor.name)} className="p-1.5 rounded hover:bg-red-100 text-red-600" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Status:</span> <Badge variant={instructor.status === 'Active' ? 'success' : 'danger'}>{instructor.status}</Badge></div>
                    <div><span className="text-gray-500">Joined:</span> {instructor.joined}</div>
                    <div><span className="text-gray-500">Courses:</span> {instructor.stats?.courses || 0}</div>
                    <div><span className="text-gray-500">Students:</span> {instructor.stats?.students || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-5 pb-5">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {/* Instructor Details Modal */}
      <AnimatePresence>
        {showModal && selectedInstructor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-bold">Instructor Details</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedInstructor.name?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedInstructor.name}</h3>
                    <p className="text-gray-500">{selectedInstructor.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="info">Instructor</Badge>
                      <Badge variant={selectedInstructor.status === 'Active' ? 'success' : 'danger'}>{selectedInstructor.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-indigo-600">{selectedInstructor.stats?.courses || 0}</p>
                    <p className="text-sm text-gray-500">Courses Created</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedInstructor.stats?.students || 0}</p>
                    <p className="text-sm text-gray-500">Total Students</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Member Since:</span><span>{selectedInstructor.createdAt?.split('T')[0]}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Last Updated:</span><span>{selectedInstructor.updatedAt?.split('T')[0]}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end p-6 pt-0 border-t mt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Instructor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">Add New Instructor</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddInstructor} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter instructor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="instructor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (Optional)</label>
                  <input
                    type="text"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Leave empty for auto-generated"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: instructor123</p>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={adding} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {adding ? 'Adding...' : 'Add Instructor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}