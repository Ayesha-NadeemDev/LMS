export const currentUser = {
  id: "u_01",
  name: "Sarah Chen",
  email: "sarah.chen@eduhub.io",
  avatar: "https://i.pravatar.cc/150?img=47",
  role: "student",
};

export const enrolledCourses = [
  {
    id: "c_101",
    title: "Advanced React Patterns & Performance",
    instructor: "Dr. Marcus Bennett",
    category: "Web Development",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600",
    progress: 68,
    totalLessons: 42,
    completedLessons: 29,
    rating: 4.8,
    lastAccessed: "2 hours ago",
  },
  {
    id: "c_102",
    title: "Machine Learning with Python",
    instructor: "Prof. Anika Sharma",
    category: "Data Science",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600",
    progress: 34,
    totalLessons: 56,
    completedLessons: 19,
    rating: 4.9,
    lastAccessed: "Yesterday",
  },
  {
    id: "c_103",
    title: "UI/UX Design Fundamentals",
    instructor: "Elena Rodriguez",
    category: "Design",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=600",
    progress: 92,
    totalLessons: 28,
    completedLessons: 26,
    rating: 4.7,
    lastAccessed: "3 days ago",
  },
  {
    id: "c_104",
    title: "Cloud Architecture on AWS",
    instructor: "James O'Connor",
    category: "DevOps",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600",
    progress: 15,
    totalLessons: 38,
    completedLessons: 6,
    rating: 4.6,
    lastAccessed: "5 days ago",
  },
];

export const recentLessons = [
  { id: "l_1", title: "useMemo vs useCallback Deep Dive", course: "Advanced React Patterns", duration: "18:42", watchedAt: "2 hours ago" },
  { id: "l_2", title: "Gradient Descent Intuition", course: "Machine Learning with Python", duration: "24:15", watchedAt: "Yesterday" },
  { id: "l_3", title: "Design Systems in Figma", course: "UI/UX Design Fundamentals", duration: "31:08", watchedAt: "3 days ago" },
];

export const notifications = [
  { id: "n_1", type: "assignment", title: "New assignment posted", message: "Dr. Bennett added 'Build a Custom Hook' to React Patterns", time: "10 min ago", unread: true },
  { id: "n_2", type: "grade", title: "Quiz graded: 94%", message: "Great work on the ML Foundations quiz!", time: "1 hour ago", unread: true },
  { id: "n_3", type: "announcement", title: "Live Q&A tomorrow", message: "Join the AWS live session at 3:00 PM EST", time: "5 hours ago", unread: false },
  { id: "n_4", type: "message", title: "New message from Elena R.", message: "Check your portfolio feedback", time: "Yesterday", unread: false },
];

export const courseCurriculum = [
  {
    id: "s_1", title: "Getting Started", duration: "45 min",
    lessons: [
      { id: "l_01", title: "Course Introduction", duration: "5:20", completed: true },
      { id: "l_02", title: "Setting Up Your Environment", duration: "12:45", completed: true },
      { id: "l_03", title: "Project Structure Overview", duration: "8:30", completed: true },
    ],
  },
  {
    id: "s_2", title: "Core Concepts", duration: "2h 15min",
    lessons: [
      { id: "l_04", title: "Component Composition Patterns", duration: "22:10", completed: true },
      { id: "l_05", title: "Render Props Explained", duration: "18:42", completed: false, current: true },
      { id: "l_06", title: "Higher-Order Components", duration: "25:30", completed: false },
      { id: "l_07", title: "Custom Hooks Deep Dive", duration: "30:15", completed: false },
    ],
  },
  {
    id: "s_3", title: "Performance Optimization", duration: "1h 40min",
    lessons: [
      { id: "l_08", title: "React.memo Strategies", duration: "20:00", completed: false },
      { id: "l_09", title: "Virtualization with react-window", duration: "28:22", completed: false },
      { id: "l_10", title: "Code Splitting & Lazy Loading", duration: "24:18", completed: false },
    ],
  },
];

export const instructorCourses = [
  { id: "ic_1", title: "Advanced React Patterns", students: 1247, revenue: 18420, rating: 4.8, status: "Published" },
  { id: "ic_2", title: "TypeScript Mastery", students: 892, revenue: 13380, rating: 4.7, status: "Published" },
  { id: "ic_3", title: "Next.js 14 Complete Guide", students: 0, revenue: 0, rating: 0, status: "Draft" },
];

export const earningsData = [
  { month: "Jan", revenue: 4200 }, { month: "Feb", revenue: 5100 },
  { month: "Mar", revenue: 4800 }, { month: "Apr", revenue: 6300 },
  { month: "May", revenue: 7200 }, { month: "Jun", revenue: 8100 },
  { month: "Jul", revenue: 9400 }, { month: "Aug", revenue: 8900 },
];

export const adminUsers = [
  { id: "u1", name: "Sarah Chen", email: "sarah.chen@eduhub.io", role: "Student", status: "Active", joined: "2024-03-15" },
  { id: "u2", name: "Marcus Bennett", email: "m.bennett@eduhub.io", role: "Instructor", status: "Active", joined: "2023-11-02" },
  { id: "u3", name: "Anika Sharma", email: "anika.s@eduhub.io", role: "Instructor", status: "Active", joined: "2023-08-19" },
  { id: "u4", name: "Liam Thompson", email: "liam.t@eduhub.io", role: "Student", status: "Suspended", joined: "2024-01-28" },
  { id: "u5", name: "Priya Patel", email: "priya.p@eduhub.io", role: "Student", status: "Active", joined: "2024-05-11" },
  { id: "u6", name: "Elena Rodriguez", email: "elena.r@eduhub.io", role: "Instructor", status: "Active", joined: "2023-06-07" },
];

export const analyticsData = [
  { name: "Mon", users: 420, revenue: 1200, engagement: 68 },
  { name: "Tue", users: 510, revenue: 1450, engagement: 72 },
  { name: "Wed", users: 480, revenue: 1380, engagement: 70 },
  { name: "Thu", users: 620, revenue: 1720, engagement: 78 },
  { name: "Fri", users: 710, revenue: 2010, engagement: 82 },
  { name: "Sat", users: 590, revenue: 1680, engagement: 75 },
  { name: "Sun", users: 450, revenue: 1290, engagement: 69 },
];