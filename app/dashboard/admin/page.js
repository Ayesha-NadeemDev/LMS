"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, BookOpen, DollarSign, Activity, Search, Filter, MoreVertical, Eye, Edit, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import StatCard from "@/components/dashboard/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalRevenue: 0,
    engagementRate: 0
  });
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // view, edit, add
  const [toastMessage, setToastMessage] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'Active'
  });

  const perPage = 5;

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setAnalyticsData(data.analyticsData);
      } else if (data.error === 'Access denied. Admin only.') {
        router.push('/dashboard/student');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?page=${page}&limit=${perPage}&role=${roleFilter}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, search]);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowUserModal(true);
  };

  const handleEditUser = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedUser(data.user);
        setEditForm({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          status: data.user.status
        });
        setModalMode('edit');
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();

      if (data.success) {
        showToast('User updated successfully!', 'success');
        setShowUserModal(false);
        fetchUsers();
        fetchDashboardData();
      } else {
        showToast(data.error || 'Update failed', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        showToast('User deleted successfully!', 'success');
        fetchUsers();
        fetchDashboardData();
      } else {
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      (roleFilter === "All" || u.role === roleFilter.toLowerCase()) &&
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
       u.email?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search, roleFilter]);

  const paginated = filteredUsers.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));

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

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of platform performance and user activity</p>
      </div>

      {/* Stats Cards - REAL DATA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} change="+12.5%" color="primary" />
        <StatCard icon={BookOpen} label="Active Courses" value={stats.publishedCourses.toLocaleString()} change="+8 new" color="green" />
        <StatCard icon={DollarSign} label="Revenue (MTD)" value={`$${(stats.totalRevenue / 1000).toFixed(1)}k`} change="+23%" color="purple" />
        <StatCard icon={Activity} label="Engagement Rate" value={`${stats.engagementRate}%`} change="+3.2%" color="orange" />
      </div>
      

      {/* Users Table */}
      <Card>
        <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Manage Users</h3>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search users..."
                className="input pl-9 w-48 border rounded-lg py-1.5 px-3"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="input pl-9 pr-8 appearance-none border rounded-lg py-1.5 px-3"
              >
                <option>All</option>
                <option>Student</option>
                <option>Instructor</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                        {u.name?.split(" ").map((n) => n[0]).join("") || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                   </td>
                  <td className="px-5 py-4">
                    <Badge variant={u.role === "instructor" ? "info" : u.role === "admin" ? "warning" : "default"}>
                      {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                    </Badge>
                   </td>
                  <td className="px-5 py-4">
                    <Badge variant={u.status === "Active" ? "success" : "danger"}>{u.status}</Badge>
                   </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{u.joined}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleViewUser(u)} className="p-1.5 rounded hover:bg-gray-200 transition" title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEditUser(u)} className="p-1.5 rounded hover:bg-gray-200 transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="p-1.5 rounded hover:bg-red-100 text-red-600 transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                   </td>
                 </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-500">No users found</td></tr>
              )}
            </tbody>
           </table>
        </div>

        <div className="px-5 pb-5">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      {/* User Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold">
                  {modalMode === 'view' ? 'User Details' : modalMode === 'edit' ? 'Edit User' : 'Add User'}
                </h2>
                <button onClick={() => setShowUserModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {modalMode === 'view' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {selectedUser.name?.split(" ").map((n) => n[0]).join("") || "U"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                        <p className="text-gray-500">{selectedUser.email}</p>
                        <Badge variant={selectedUser.role === "instructor" ? "info" : "default"} className="mt-1">
                          {selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div><p className="text-sm text-gray-500">Status</p><p className="font-medium">{selectedUser.status}</p></div>
                      <div><p className="text-sm text-gray-500">Joined</p><p className="font-medium">{selectedUser.joined}</p></div>
                      {selectedUser.role === 'instructor' && (
                        <div><p className="text-sm text-gray-500">Courses</p><p className="font-medium">{selectedUser.stats?.courses || 0}</p></div>
                      )}
                      {selectedUser.role === 'student' && (
                        <div><p className="text-sm text-gray-500">Enrollments</p><p className="font-medium">{selectedUser.stats?.enrollments || 0}</p></div>
                      )}
                    </div>
                  </div>
                )}

                {modalMode === 'edit' && (
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Full Name</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Role</label>
                      <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                        <option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Status</label>
                      <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                        <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end p-6 pt-0 border-t mt-4">
                <button onClick={() => setShowUserModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                {modalMode === 'edit' && (
                  <button onClick={handleUpdateUser} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}