"use client";
import { useState, useEffect } from "react";
import { BookOpen, Users, DollarSign, TrendingUp, Plus, Upload, Edit2, Trash2, Video, X, Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

export default function InstructorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "Web Development",
    price: "",
    thumbnail: "📚",
    level: "Beginner",
    duration: ""
  });
  
  // ✅ SIMPLE Upload Form - Sirf 2 options
  const [uploadForm, setUploadForm] = useState({
    courseId: "",
    videoFile: null
  });

  // Fetch dashboard data from backend
  useEffect(() => {
    fetchDashboardData();
    fetchCourses();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const res = await fetch('/api/instructor/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setDashboardData(data);
      } else if (data.error === 'Access denied. Instructor only.') {
        router.push('/dashboard/student');
      }
    } catch (error) {
      console.error('Error:', error);
      toast('Failed to load dashboard', 'error');
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/instructor/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      
      if (data.success) {
        toast('Course created successfully!', 'success');
        setShowCreate(false);
        setCreateForm({ title: "", description: "", category: "Web Development", price: "", thumbnail: "📚", level: "Beginner", duration: "" });
        fetchCourses();
        fetchDashboardData();
      } else {
        toast(data.error || 'Failed to create course', 'error');
      }
    } catch (error) {
      toast('Something went wrong', 'error');
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        toast('Course deleted successfully', 'success');
        fetchCourses();
        fetchDashboardData();
      } else {
        toast(data.error || 'Failed to delete course', 'error');
      }
    } catch (error) {
      toast('Something went wrong', 'error');
    }
  };

  const handlePublishCourse = async (courseId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !currentStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        toast(`Course ${!currentStatus ? 'published' : 'unpublished'}`, 'success');
        fetchCourses();
        fetchDashboardData();
      } else {
        toast(data.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      toast('Something went wrong', 'error');
    }
  };
if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || { totalCourses: 0, totalStudents: 0, totalRevenue: 0 };
  const profile = dashboardData?.profile || { rating: 0 };

  const topCourses = [...courses].sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto mt-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your courses and track your earnings</p>
        </div>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses || 0} change="+2 this quarter" color="primary" />
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents?.toLocaleString() || 0} change="+18% growth" color="green" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue?.toLocaleString() || 0}`} change="+$4.2k this month" color="purple" />
        <StatCard icon={TrendingUp} label="Avg. Rating" value={profile.rating || 0} change="+0.2 this month" color="orange" />
      </div>

      {/* Top Performing Courses */}
      <div className="grid lg:grid-cols-1 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Performing Courses</h3>
          <div className="space-y-4">
            {topCourses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No courses yet. Create your first course!</p>
            ) : (
              topCourses.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.students || 0} students • ${c.revenue || 0}</p>
                  </div>
                  <Badge variant={c.isPublished ? "success" : "warning"} className="text-xs">
                    {c.isPublished ? "Live" : "Draft"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* My Courses Table */}
      <Card>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">My Courses</h3>
          <input 
            placeholder="Search courses..." 
            className="input max-w-xs px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Students</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                    No courses yet. Click "Create Course" to get started.
                   </td>
                </tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-5 py-4 font-medium text-sm text-gray-900 dark:text-white">{c.title}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{c.students?.toLocaleString() || 0}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">${c.revenue?.toLocaleString() || 0}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{c.rating > 0 ? `★ ${c.rating}` : "—"}</td>
                    <td className="px-5 py-4">
                      <Badge variant={c.isPublished ? "success" : "warning"}>
                        {c.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button 
                          onClick={() => router.push(`/dashboard/instructor/courses/${c.id}`)}
                          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-600 dark:text-gray-400"
                          title="Edit Course"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handlePublishCourse(c.id, c.isPublished)}
                          className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition"
                          title={c.isPublished ? "Unpublish" : "Publish"}
                        >
                          {c.isPublished ? "📖" : "🔒"}
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition"
                          title="Delete Course"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Course Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Course" size="lg">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5 text-gray-700 dark:text-gray-300">Course Title *</label>
            <input 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., Complete TypeScript Guide"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5 text-gray-700 dark:text-gray-300">Description *</label>
            <textarea 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="What will students learn?"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5 text-gray-700 dark:text-gray-300">Category</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              >
                <option value="Web Development">🌐 Web Development</option>
                <option value="Data Science">📊 Data Science</option>
                <option value="Design">🎨 Design</option>
                <option value="DevOps">⚙️ DevOps</option>
                <option value="AI/ML">🤖 AI/ML</option>
                <option value="Mobile Development">📱 Mobile Development</option>
                <option value="Cloud Computing">☁️ Cloud Computing</option>
                <option value="Cyber Security">🔒 Cyber Security</option>
                <option value="Digital Marketing">📢 Digital Marketing</option>
                <option value="Business">💼 Business</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5 text-gray-700 dark:text-gray-300">Price (USD)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="49"
                value={createForm.price}
                onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Create Course</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}