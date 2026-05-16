"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Clock, PlayCircle } from "lucide-react";

export default function CourseCard({ course, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
    >
      <Link href={`/dashboard/student/course/${course.id}`}>
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
          className="group relative glass rounded-2xl overflow-hidden h-full flex flex-col cursor-pointer"
          style={{ willChange: "transform" }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />

          <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-white/5">
            <motion.img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl"
              >
                <PlayCircle className="text-indigo-600 ml-0.5" size={28} />
              </motion.div>
            </div>
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white bg-gradient-to-r ${course.color} shadow-lg`}>
                {course.category.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">by {course.instructor}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                {course.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {course.duration}
              </span>
            </div>

            <div className="mt-auto space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{course.completedLessons}/{course.totalLessons} lessons</span>
                <span className="font-semibold">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${course.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.05 }}
                  className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                  style={{ boxShadow: "0 0 12px rgba(99,102,241,0.4)" }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full mt-2 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${course.color} shadow-lg group-hover:shadow-xl transition-shadow`}
              >
                {course.progress === 100 ? "Review Course" : "Continue Learning"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}