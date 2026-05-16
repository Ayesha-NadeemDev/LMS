import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Get token from header (if provided)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // ========================================
    // STEP 1: DELETE ALL OLD DATA
    // ========================================
    console.log("🗑️ Deleting old data...")
    
    const courses = db.collection("courses")
    const assignments = db.collection("assignments")
    const students = db.collection("students")
    
    await courses.deleteMany({})
    await assignments.deleteMany({})
    
    console.log("✅ Old data deleted")
    
    // ========================================
    // STEP 2: ADD NEW COURSES
    // ========================================
    const dummyCourses = [
      {
        title: "Web Development Bootcamp",
        description: "Learn full stack web development from scratch. Master HTML, CSS, JavaScript, React, Node.js and MongoDB.",
        instructor: "Dr. Sarah Johnson",
        instructorId: "instructor_1",
        thumbnail: "🌐",
        category: "Development",
        level: "beginner",
        duration: 40,
        lessons: [
          { id: 1, title: "HTML Fundamentals", duration: "2 hours" },
          { id: 2, title: "CSS Styling", duration: "3 hours" },
          { id: 3, title: "JavaScript Basics", duration: "4 hours" },
          { id: 4, title: "React.js", duration: "5 hours" },
          { id: 5, title: "Node.js & Express", duration: "4 hours" },
          { id: 6, title: "MongoDB Database", duration: "3 hours" }
        ],
        isPublished: true,
        enrolledCount: 0,
        rating: 4.8,
        createdAt: new Date()
      },
      {
        title: "UI/UX Design Fundamentals",
        description: "Master user interface and user experience design. Learn Figma, prototyping, and design principles.",
        instructor: "Emily Davis",
        instructorId: "instructor_2",
        thumbnail: "🎨",
        category: "Design",
        level: "beginner",
        duration: 25,
        lessons: [
          { id: 1, title: "Design Principles", duration: "2 hours" },
          { id: 2, title: "Figma Basics", duration: "3 hours" },
          { id: 3, title: "Wireframing", duration: "2 hours" },
          { id: 4, title: "Prototyping", duration: "3 hours" },
          { id: 5, title: "User Research", duration: "2 hours" },
          { id: 6, title: "Design Systems", duration: "3 hours" }
        ],
        isPublished: true,
        enrolledCount: 0,
        rating: 4.7,
        createdAt: new Date()
      },
      {
        title: "Python for Data Science",
        description: "Learn Python programming and data science fundamentals. Master pandas, numpy, and data analysis.",
        instructor: "Prof. Alan Lee",
        instructorId: "instructor_3",
        thumbnail: "🐍",
        category: "Programming",
        level: "beginner",
        duration: 35,
        lessons: [
          { id: 1, title: "Python Basics", duration: "3 hours" },
          { id: 2, title: "Data Types & Structures", duration: "2 hours" },
          { id: 3, title: "Functions & Modules", duration: "2 hours" },
          { id: 4, title: "NumPy Fundamentals", duration: "3 hours" },
          { id: 5, title: "Pandas for Data Analysis", duration: "4 hours" },
          { id: 6, title: "Data Visualization", duration: "3 hours" }
        ],
        isPublished: true,
        enrolledCount: 0,
        rating: 4.9,
        createdAt: new Date()
      },
      {
        title: "Mobile App Development with Flutter",
        description: "Build cross-platform mobile apps for iOS and Android using Flutter and Dart.",
        instructor: "Mark Wilson",
        instructorId: "instructor_4",
        thumbnail: "📱",
        category: "Development",
        level: "intermediate",
        duration: 30,
        lessons: [
          { id: 1, title: "Flutter Setup", duration: "2 hours" },
          { id: 2, title: "Dart Basics", duration: "3 hours" },
          { id: 3, title: "Widgets & Layouts", duration: "4 hours" },
          { id: 4, title: "State Management", duration: "3 hours" },
          { id: 5, title: "Navigation & Routing", duration: "2 hours" },
          { id: 6, title: "API Integration", duration: "3 hours" }
        ],
        isPublished: true,
        enrolledCount: 0,
        rating: 4.6,
        createdAt: new Date()
      },
      {
        title: "Cybersecurity Fundamentals",
        description: "Learn cybersecurity basics, network security, encryption, and threat detection.",
        instructor: "Lisa Chen",
        instructorId: "instructor_5",
        thumbnail: "🔐",
        category: "Security",
        level: "beginner",
        duration: 20,
        lessons: [
          { id: 1, title: "Security Concepts", duration: "2 hours" },
          { id: 2, title: "Network Security", duration: "3 hours" },
          { id: 3, title: "Encryption Basics", duration: "2 hours" },
          { id: 4, title: "Threat Detection", duration: "3 hours" },
          { id: 5, title: "Security Best Practices", duration: "2 hours" }
        ],
        isPublished: true,
        enrolledCount: 0,
        rating: 4.8,
        createdAt: new Date()
      }
    ]
    
    const courseResult = await courses.insertMany(dummyCourses)
    const courseIds = Object.values(courseResult.insertedIds).map(id => id.toString())
    
    console.log(`✅ Added ${courseResult.insertedCount} courses`)
    
    // ========================================
    // STEP 3: ADD ASSIGNMENTS
    // ========================================
    const dummyAssignments = [
      {
        title: "React Components Assignment",
        description: "Create a reusable React component library with at least 5 components including props validation, state management, and prop types. Components should be well-documented and responsive.",
        courseId: courseIds[0],
        courseName: "Web Development Bootcamp",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "pending",
        totalPoints: 100,
        createdAt: new Date(),
        submissions: []
      },
      {
        title: "Python Functions Exercise",
        description: "Write 10 Python functions covering loops, conditionals, lists, dictionaries, and file handling. Include docstrings and error handling for each function.",
        courseId: courseIds[2],
        courseName: "Python for Data Science",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "pending",
        totalPoints: 80,
        createdAt: new Date(),
        submissions: []
      },
      {
        title: "Figma Design Project",
        description: "Create a complete mobile app design in Figma including wireframes, prototype, and design system.",
        courseId: courseIds[1],
        courseName: "UI/UX Design Fundamentals",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: "pending",
        totalPoints: 120,
        createdAt: new Date(),
        submissions: []
      }
    ]
    
    const assignmentResult = await assignments.insertMany(dummyAssignments)
    console.log(`✅ Added ${assignmentResult.insertedCount} assignments`)
    
    // ========================================
    // STEP 4: ENROLL STUDENT (IF TOKEN PROVIDED)
    // ========================================
    let enrollResult = { enrolled: false, message: "No token provided" }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
        
        // Check if student exists, if not create one
        let student = await students.findOne({ userId: decoded.id })
        
        if (!student) {
          await students.insertOne({
            userId: decoded.id,
            studentId: `STU${Date.now()}`,
            name: decoded.name || "Student",
            email: decoded.email,
            enrolledCourses: courseIds,
            progress: {},
            achievements: [],
            streak: 0,
            totalPoints: 0,
            totalHours: 0,
            completedCourses: 0,
            createdAt: new Date()
          })
        } else {
          // Update enrolled courses
          await students.updateOne(
            { userId: decoded.id },
            { 
              $set: { 
                enrolledCourses: courseIds,
                updatedAt: new Date() 
              }
            }
          )
        }
        
        // Set initial progress to 0 for each course
        const progressUpdate = {}
        courseIds.forEach(cid => {
          progressUpdate[`progress.${cid}`] = 0
        })
        await students.updateOne(
          { userId: decoded.id },
          { $set: progressUpdate }
        )
        
        enrollResult = {
          enrolled: true,
          message: `✅ Student enrolled in ${courseIds.length} courses`,
          enrolledCourses: courseIds.length
        }
      } catch (err) {
        enrollResult = { enrolled: false, error: "Invalid token" }
      }
    }
    
    // ========================================
    // STEP 5: RETURN RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      message: "Data seeded successfully!",
      courses: {
        added: courseResult.insertedCount,
        list: dummyCourses.map((c, i) => ({
          id: courseIds[i],
          title: c.title,
          instructor: c.instructor,
          thumbnail: c.thumbnail
        }))
      },
      assignments: {
        added: assignmentResult.insertedCount,
        list: dummyAssignments.map((a, i) => ({
          id: assignmentResult.insertedIds[i],
          title: a.title,
          courseName: a.courseName,
          dueDate: a.dueDate
        }))
      },
      enrollment: enrollResult
    })
    
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}