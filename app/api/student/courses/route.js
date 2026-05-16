import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Get student profile
    const students = db.collection("students")
    const student = await students.findOne({ userId: decoded.id })
    
    if (!student) {
      return NextResponse.json({ success: true, courses: [], total: 0 })
    }
    
    const enrolledCourseIds = student.enrolledCourses || []
    
    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({ success: true, courses: [], total: 0 })
    }
    
    // Get course details
    const courses = db.collection("courses")
    const enrolledCourses = await courses.find({
      _id: { $in: enrolledCourseIds.map(id => new ObjectId(id)) }
    }).toArray()
    
    // Format courses with progress
    const formattedCourses = enrolledCourses.map(course => ({
      id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      thumbnail: course.thumbnail,
      category: course.category,
      level: course.level,
      duration: course.duration,
      progress: student.progress?.[course._id.toString()] || 0,
      totalLessons: course.lessons?.length || 0,
      completedLessons: Math.floor(((student.progress?.[course._id.toString()] || 0) / 100) * (course.lessons?.length || 0)),
      lastAccessed: student.lastAccessed || new Date().toISOString()
    }))
    
    return NextResponse.json({
      success: true,
      courses: formattedCourses,
      total: formattedCourses.length
    })
    
  } catch (error) {
    console.error('Courses API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}