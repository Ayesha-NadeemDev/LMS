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
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    
    if (!user || user.role !== 'instructor') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    // Get instructor's courses
    const courses = db.collection("courses")
    const instructorCourses = await courses.find({ 
      instructorId: decoded.id 
    }).toArray()
    
    const courseIds = instructorCourses.map(c => c._id.toString())
    
    // Get all enrollments for these courses
    const enrollments = db.collection("enrollments")
    const allEnrollments = await enrollments.find({
      courseId: { $in: courseIds }
    }).toArray()
    
    // Get unique students
    const studentIds = [...new Set(allEnrollments.map(e => e.studentId))]
    
    const users = db.collection("users")
    const students = await Promise.all(studentIds.map(async (studentId) => {
      const student = await users.findOne({ _id: new ObjectId(studentId) })
      const studentEnrollments = allEnrollments.filter(e => e.studentId === studentId)
      const totalProgress = studentEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0)
      
      return {
        id: studentId,
        name: student?.name || 'Unknown',
        email: student?.email,
        enrolledCourses: studentEnrollments.length,
        averageProgress: studentEnrollments.length > 0 ? Math.round(totalProgress / studentEnrollments.length) : 0,
        joinedAt: student?.createdAt
      }
    }))
    
    // Statistics
    const stats = {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.averageProgress > 0).length,
      averageProgress: students.length > 0 
        ? Math.round(students.reduce((sum, s) => sum + s.averageProgress, 0) / students.length)
        : 0
    }
    
    return NextResponse.json({
      success: true,
      students: students,
      stats: stats
    })
    
  } catch (error) {
    console.error('Instructor Students Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}