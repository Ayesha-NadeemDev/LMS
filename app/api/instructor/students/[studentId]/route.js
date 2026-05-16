import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

// GET - Get single student details with all enrolled courses
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { studentId } = params
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Check if user is instructor
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    if (!user || user.role !== 'instructor') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    // Get student details
    const student = await db.collection("users").findOne({ _id: new ObjectId(studentId) })
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    
    // Get instructor's courses
    const courses = db.collection("courses")
    const instructorCourses = await courses.find({ 
      instructorId: decoded.id 
    }).toArray()
    
    const courseIds = instructorCourses.map(c => c._id.toString())
    
    // Get student's enrollments
    const enrollments = db.collection("enrollments")
    const studentEnrollments = await enrollments.find({
      studentId: studentId,
      courseId: { $in: courseIds }
    }).toArray()
    
    // Get detailed course progress
    const coursesWithProgress = []
    let totalProgress = 0
    let completedLessons = 0
    let totalLessons = 0
    
    for (const enrollment of studentEnrollments) {
      const course = instructorCourses.find(c => c._id.toString() === enrollment.courseId)
      if (course) {
        const courseLessons = course.lessons?.length || 0
        const completed = Math.floor(((enrollment.progress || 0) / 100) * courseLessons)
        
        totalProgress += enrollment.progress || 0
        completedLessons += completed
        totalLessons += courseLessons
        
        coursesWithProgress.push({
          id: course._id,
          title: course.title,
          progress: enrollment.progress || 0,
          enrolledAt: enrollment.enrolledAt,
          lastAccessed: enrollment.lastAccessed,
          completedLessons: completed,
          totalLessons: courseLessons,
          grade: enrollment.grade || 'In Progress'
        })
      }
    }
    
    const avgProgress = studentEnrollments.length > 0 
      ? Math.round(totalProgress / studentEnrollments.length) 
      : 0
    
    // Get certificates
    const certificates = await db.collection("certificates").find({
      studentId: studentId
    }).toArray()
    
    return NextResponse.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff`,
        enrolledCourses: coursesWithProgress,
        overallProgress: avgProgress,
        totalCertificates: certificates.length,
        enrollments: studentEnrollments
      },
      stats: {
        averageProgress: avgProgress,
        completedLessons: completedLessons,
        totalLessons: totalLessons,
        certificatesEarned: certificates.length
      }
    })
    
  } catch (error) {
    console.error('Student details error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update student progress or send message
export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { studentId } = params
    const { courseId, progress, message } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Check if user is instructor
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    if (!user || user.role !== 'instructor') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    if (courseId && progress !== undefined) {
      // Update student's progress for a specific course
      await db.collection("enrollments").updateOne(
        { studentId: studentId, courseId: courseId },
        { $set: { progress: progress, lastAccessed: new Date() } }
      )
      
      return NextResponse.json({
        success: true,
        message: "Progress updated successfully"
      })
    }
    
    if (message) {
      // In real app, store message in notifications collection
      await db.collection("notifications").insertOne({
        studentId: studentId,
        instructorId: decoded.id,
        message: message,
        type: 'message',
        read: false,
        createdAt: new Date()
      })
      
      return NextResponse.json({
        success: true,
        message: "Message sent successfully"
      })
    }
    
    return NextResponse.json({ error: "No action specified" }, { status: 400 })
    
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}