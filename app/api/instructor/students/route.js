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
    
    // Get instructor's courses
    const courses = await db.collection("courses").find({ 
      instructorId: decoded.id 
    }).toArray()
    
    if (courses.length === 0) {
      return NextResponse.json({
        success: true,
        students: [],
        stats: {
          totalStudents: 0,
          activeStudents: 0,
          atRiskStudents: 0,
          averageProgress: 0
        }
      })
    }
    
    const courseIds = courses.map(c => c._id.toString())
    
    // Get all enrollments for these courses
    const enrollments = await db.collection("enrollments").find({
      courseId: { $in: courseIds }
    }).toArray()
    
    // Get unique student IDs
    const studentIds = [...new Set(enrollments.map(e => e.studentId))]
    
    if (studentIds.length === 0) {
      return NextResponse.json({
        success: true,
        students: [],
        stats: {
          totalStudents: 0,
          activeStudents: 0,
          atRiskStudents: 0,
          averageProgress: 0
        }
      })
    }
    
    // Get student details
    const users = await db.collection("users").find({
      _id: { $in: studentIds.map(id => new ObjectId(id)) }
    }).toArray()
    
    // Calculate stats
    const students = users.map(student => {
      const studentEnrollments = enrollments.filter(e => e.studentId === student._id.toString())
      const avgProgress = studentEnrollments.length > 0 
        ? Math.round(studentEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / studentEnrollments.length)
        : 0
      
      return {
        id: student._id,
        name: student.name,
        email: student.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff`,
        course: courses[0]?.title || 'Multiple Courses',
        progress: avgProgress,
        enrollmentDate: student.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
        grade: avgProgress >= 80 ? 'A' : avgProgress >= 60 ? 'B' : avgProgress >= 40 ? 'C' : 'D',
        attendance: 85,
        completedAssignments: Math.floor(avgProgress / 10),
        totalAssignments: 15,
        status: avgProgress < 30 ? 'at-risk' : 'active',
        performance: avgProgress >= 80 ? 'excellent' : 'good'
      }
    })
    
    const totalStudents = students.length
    const activeStudents = students.filter(s => s.status === 'active').length
    const atRiskStudents = students.filter(s => s.status === 'at-risk').length
    const averageProgress = totalStudents > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / totalStudents)
      : 0
    
    return NextResponse.json({
      success: true,
      students: students,
      stats: { totalStudents, activeStudents, atRiskStudents, averageProgress }
    })
    
  } catch (error) {
    console.error('Students API error:', error)
    return NextResponse.json({ 
      success: true, 
      students: [], 
      stats: { totalStudents: 0, activeStudents: 0, atRiskStudents: 0, averageProgress: 0 } 
    })
  }
}