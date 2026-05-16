"use client";
import { useState, useMemo } from "react";
import { Users, BookOpen, DollarSign, Activity, Search, Filter, MoreVertical } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import StatCard from "@/components/dashboard/StatCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { adminUsers, analyticsData } from "@/lib/dummy-data";

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => {
    return adminUsers.filter((u) =>
      (roleFilter === "All" || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, roleFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of platform performance and user activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value="24,891" change="+12.5%" color="primary" />
        <StatCard icon={BookOpen} label="Active Courses" value="438" change="+8 new" color="green" />
        <StatCard icon={DollarSign} label="Revenue (MTD)" value="$184.2k" change="+23%" color="purple" />
        <StatCard icon={Activity} label="Engagement Rate" value="74.8%" change="+3.2%" color="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-1">Weekly Users & Revenue</h3>
          <p className="text-xs text-gray-500 mb-4">Combined view</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:!stroke-slate-700" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8, color: "#fff" }} />
              <Legend />
              <Bar dataKey="users" fill="#4f6bff" radius={[6, 6, 0, 0]} />
              <Bar dataKey="revenue" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-1">Engagement Trend</h3>
          <p className="text-xs text-gray-500 mb-4">Daily engagement score</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:!stroke-slate-700" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8, color: "#fff" }} />
              <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3}
                dot={{ fill: "#10b981", r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Manage Users</h3>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search users..." className="input pl-9 w-48" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="input pl-9 pr-8 appearance-none">
                <option>All</option><option>Student</option><option>Instructor</option>
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
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={u.role === "Instructor" ? "info" : "default"}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={u.status === "Active" ? "success" : "danger"}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{u.joined}</td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                      <MoreVertical size={16} />
                    </button>
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
    </div>
  );
}