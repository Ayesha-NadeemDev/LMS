import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Get user
    const users = db.collection("users")
    const user = await users.findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } }
    )
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Get or create student profile
    const students = db.collection("students")
    let student = await students.findOne({ userId: decoded.id })
    
    if (!student && user.role === 'student') {
      const newStudent = {
        userId: decoded.id,
        studentId: `STU${Date.now()}`,
        name: user.name,
        email: user.email,
        enrolledCourses: [],
        progress: {},
        achievements: [],
        streak: 0,
        totalPoints: 0,
        totalHours: 0,
        completedCourses: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const result = await students.insertOne(newStudent)
      student = await students.findOne({ _id: result.insertedId })
    }
    
    // Get enrolled courses with details
    const courses = db.collection("courses")
    const enrolledCourseIds = student?.enrolledCourses || []
    
    let enrolledCoursesData = []
    let totalProgress = 0
    let completedCount = 0
    let totalHours = 0
    
    // Fetch details for each enrolled course
    for (const courseId of enrolledCourseIds) {
      const course = await courses.findOne({ _id: new ObjectId(courseId) })
      if (course) {
        const courseProgress = student?.progress?.[courseId] || 0
        totalProgress += courseProgress
        
        // Count completed courses (progress >= 100)
        if (courseProgress >= 100) {
          completedCount++
        }
        
        // Calculate hours (assuming each lesson takes 1 hour, or use course duration)
        const lessonsCount = course.lessons?.length || 0
        const completedLessons = Math.floor((courseProgress / 100) * lessonsCount)
        totalHours += completedLessons
        
        enrolledCoursesData.push({
          id: course._id.toString(),
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=240&fit=crop',
          instructor: course.instructorName || 'Unknown Instructor',
          progress: courseProgress,
          totalLessons: lessonsCount,
          completedLessons: completedLessons,
          category: course.category,
          level: course.level,
          price: course.price
        })
      }
    }
    
    // Calculate statistics
    const enrolledCount = enrolledCourseIds.length
    const averageProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0
    
    // Return response matching frontend expectations
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile: {
        studentId: student?.studentId,
        streak: student?.streak || 0,
        totalPoints: student?.totalPoints || 0,
        totalHours: student?.totalHours || 0,
        completedCourses: completedCount
      },
      stats: {
        totalCourses: enrolledCount,        
        completedCourses: completedCount,    
        totalHours: totalHours,              
        averageProgress: averageProgress     
      },
      courses: enrolledCoursesData           
    })
    
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}