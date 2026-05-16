"use client";

import { BookOpen, Clock, Award, TrendingUp, PlayCircle, Bell, ArrowRight, Flame } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import PageTransition from "@/components/student/PageTransition";
import StatCard from "@/components/dashboard/StatCard";
import CourseCard from "@/components/dashboard/CourseCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import TypingText from "@/components/student/TypingText";

import {
  enrolledCourses,
  recentLessons,
  notifications,
  currentUser,
  stats,
  courses,
  studentProfile,
} from "@/lib/dummy-data";

export default function StudentDashboard() {
  const continueCourses = courses
    .filter((c) => c.progress > 0 && c.progress < 100)
    .slice(0, 3);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative glass-strong rounded-3xl p-6 md:p-8 overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 opacity-10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame size={16} className="text-orange-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                  {studentProfile?.streak || "0"}-day streak
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold">
                <TypingText
                  text={`Welcome back, ${currentUser.name.split(" ")[0]} 👋`}
                  speed={55}
                />
              </h1>

              <p className="text-gray-500 dark:text-gray-400 mt-2">
                You have 3 lessons due this week. Keep it up!
              </p>
            </div>

            <Link
              href="/dashboard/student/courses"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-lg"
            >
              Browse Courses <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Enrolled Courses" value={stats?.enrolled || 12} color="primary" />
          <StatCard icon={Clock} label="Hours Learned" value={stats?.hoursLearned || 84.5} color="green" />
          <StatCard icon={Award} label="Certificates" value={stats?.completed || 4} color="purple" />
          <StatCard icon={TrendingUp} label="Progress" value={stats?.overallProgress || 75} suffix="%" color="orange" />
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Continue Learning</h2>
                <Link href="/dashboard/student/courses" className="text-sm text-indigo-600 hover:underline">
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {enrolledCourses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </section>

            {/* RECENT LESSONS */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4 font-semibold">
                <PlayCircle size={18} /> Recent Lessons
              </div>

              <div className="space-y-3">
                {recentLessons.map((l) => (
                  <div key={l.id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <PlayCircle size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{l.title}</p>
                      <p className="text-xs text-gray-500 truncate">{l.course}</p>
                      <p className="text-xs text-gray-400">{l.duration} • {l.watchedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* NOTIFICATIONS */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell size={18} /> Notifications
                </h3>

                <Badge variant="danger">
                  {notifications.filter((n) => n.unread).length}
                </Badge>
              </div>

              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex gap-3">
                    {n.unread && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />}
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.message}</p>
                      <p className="text-xs text-gray-400">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}