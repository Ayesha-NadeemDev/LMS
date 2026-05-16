"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle, ChevronLeft, ChevronRight, Clock, Star, Users, Download, Share2, FileQuestion } from "lucide-react";
import PageTransition from "@/components/student/PageTransition";
import { useStudent } from "@/context/StudentContext";
import { courses, lessonsByCourse } from "@/lib/student-data";

export default function CoursePage() {
  const { id } = useParams();
  const course = courses.find((c) => c.id === id) || courses[0];
  const lessons = lessonsByCourse[course.id] || lessonsByCourse.c_101;

  const startIdx = lessons.findIndex((l) => l.current) !== -1
    ? lessons.findIndex((l) => l.current)
    : lessons.findIndex((l) => !l.completed);

  const [currentIdx, setCurrentIdx] = useState(startIdx === -1 ? 0 : startIdx);
  const [completed, setCompleted] = useState(
    new Set(lessons.filter((l) => l.completed).map((l) => l.id))
  );
  const { showToast } = useStudent();

  const current = lessons[currentIdx];
  const progress = Math.round((completed.size / lessons.length) * 100);

  const toggleComplete = () => {
    const next = new Set(completed);
    if (next.has(current.id)) {
      next.delete(current.id);
      showToast("Marked as incomplete");
    } else {
      next.add(current.id);
      showToast("Lesson completed! 🎉");
    }
    setCompleted(next);
  };

  const goTo = (idx) => {
    if (idx >= 0 && idx < lessons.length) setCurrentIdx(idx);
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
        >
          <span>Courses</span>
          <ChevronRight size={14} />
          <span>{course.category}</span>
          <ChevronRight size={14} />
          <span className="text-gray-900 dark:text-white font-medium truncate">{course.title}</span>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="aspect-video relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center group cursor-pointer overflow-hidden"
                >
                  <img src={course.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10 w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl"
                    style={{ boxShadow: "0 0 60px rgba(99,102,241,0.5)" }}
                  >
                    {current.type === "quiz"
                      ? <FileQuestion className="text-indigo-600" size={32} />
                      : <Play className="text-indigo-600 ml-1" size={32} fill="currentColor" />}
                  </motion.div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 text-xs mb-2 opacity-80">
                      <Clock size={12} /> {current.duration}
                      <span>•</span>
                      <span>Lesson {currentIdx + 1} of {lessons.length}</span>
                    </div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "35%" }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-gradient-to-r ${course.color} text-white mb-2`}>
                      {course.category}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold">{current.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Taught by {course.instructor}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} className="p-2.5 rounded-xl glass hover:border-indigo-500/50"><Share2 size={16} /></motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} className="p-2.5 rounded-xl glass hover:border-indigo-500/50"><Download size={16} /></motion.button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 py-4 border-y border-gray-200/70 dark:border-white/10">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Star className="fill-yellow-400 text-yellow-400" size={14} />
                    <strong>{course.rating}</strong>
                    <span className="text-gray-500">rating</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Users size={14} /> 12,450 students
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock size={14} /> {course.duration}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                  {current.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleComplete}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition ${
                      completed.has(current.id)
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }`}
                  >
                    <CheckCircle size={16} />
                    {completed.has(current.id) ? "Completed" : "Mark as Complete"}
                  </motion.button>

                  <div className="flex gap-2 ml-auto">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goTo(currentIdx - 1)}
                      disabled={currentIdx === 0}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl glass text-sm font-medium disabled:opacity-40 hover:border-indigo-500/50"
                    >
                      <ChevronLeft size={14} /> Prev
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goTo(currentIdx + 1)}
                      disabled={currentIdx === lessons.length - 1}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium disabled:opacity-40 shadow-lg"
                    >
                      Next <ChevronRight size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5 lg:sticky lg:top-20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Course Content</h3>
                <span className="text-xs text-gray-500">{lessons.length} lessons</span>
              </div>

              <div className="mb-5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                    style={{ boxShadow: "0 0 10px rgba(99,102,241,0.5)" }}
                  />
                </div>
              </div>

              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {lessons.map((lesson, i) => {
                  const isCurrent = i === currentIdx;
                  const isDone = completed.has(lesson.id);
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => goTo(i)}
                      className={`relative w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                        isCurrent
                          ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30"
                          : "hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {isCurrent && (
                        <motion.span
                          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-500/30"
                        />
                      )}
                      <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isDone
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                          : isCurrent
                          ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                          : "bg-gray-200 dark:bg-white/10 text-gray-500"
                      }`}>
                        {isDone
                          ? <CheckCircle size={14} />
                          : lesson.type === "quiz"
                          ? <FileQuestion size={14} />
                          : <Play size={12} fill="currentColor" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDone ? "text-gray-400 line-through" : ""}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                          <Clock size={10} /> {lesson.duration}
                          {lesson.type === "quiz" && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 text-[10px] font-semibold uppercase">Quiz</span>
                          )}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}