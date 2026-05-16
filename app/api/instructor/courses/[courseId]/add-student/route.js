import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { courseId } = params
    const { email, name, password } = await request.json()
    
    console.log('=== ADD STUDENT ===')
    console.log('Course ID:', courseId)
    console.log('Email:', email)
    console.log('Name:', name)
    
    // Validation
    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Verify course exists
    const course = await db.collection("courses").findOne({ _id: new ObjectId(courseId) })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    
    // Verify instructor owns this course
    if (course.instructorId !== decoded.id) {
      return NextResponse.json({ error: "You don't own this course" }, { status: 403 })
    }
    
    // ✅ Check if student exists by email
    let student = await db.collection("users").findOne({ email })
    
    if (!student) {
      // ✅ CREATE NEW STUDENT (email doesn't exist)
      console.log('Creating new student with email:', email)
      
      const hashedPassword = await bcrypt.hash(password || 'student123', 10)
      const newStudent = {
        email,
        name: name,
        password: hashedPassword,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection("users").insertOne(newStudent)
      student = await db.collection("users").findOne({ _id: result.insertedId })
      
      // Create student profile
      await db.collection("students").insertOne({
        userId: student._id.toString(),
        studentId: `STU${Date.now()}`,
        name: student.name,
        email: student.email,
        enrolledCourses: [],
        progress: {},
        achievements: [],
        streak: 0,
        totalPoints: 0,
        totalHours: 0,
        completedCourses: 0,
        createdAt: new Date()
      })
      
      console.log('New student created with ID:', student._id)
    } else {
      console.log('Student already exists:', student.name)
    }
    
    // ✅ Check if student is already enrolled in THIS course
    const existingEnrollment = await db.collection("enrollments").findOne({
      studentId: student._id.toString(),
      courseId: courseId
    })
    
    if (existingEnrollment) {
      return NextResponse.json({ 
        error: `${student.name} is already enrolled in "${course.title}"` 
      }, { status: 400 })
    }
    
    // ✅ ENROLL STUDENT IN COURSE
    await db.collection("enrollments").insertOne({
      studentId: student._id.toString(),
      courseId: courseId,
      progress: 0,
      enrolledAt: new Date(),
      lastAccessed: new Date(),
      status: 'active'
    })
    
    // ✅ Update student's enrolled courses array
    await db.collection("students").updateOne(
      { userId: student._id.toString() },
      { 
        $push: { enrolledCourses: courseId },
        $set: { [`progress.${courseId}`]: 0 }
      }
    )
    
    // ✅ Increment course enrollment count
    await db.collection("courses").updateOne(
      { _id: new ObjectId(courseId) },
      { $inc: { enrolledCount: 1 } }
    )
    
    // Get total enrolled students count
    const totalEnrolled = await db.collection("enrollments").countDocuments({ courseId: courseId })
    
    return NextResponse.json({
      success: true,
      message: `${student.name} has been added to "${course.title}"`,
      student: { 
        id: student._id, 
        name: student.name, 
        email: student.email,
        isNew: !existingEnrollment
      },
      totalEnrolled: totalEnrolled
    })
    
  } catch (error) {
    console.error('Add student error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}