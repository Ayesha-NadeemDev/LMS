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
    
    const courses = await db.collection("courses").find({ 
      instructorId: decoded.id 
    }).toArray()
    
    // Get enrollment counts for each course
    const enrollments = db.collection("enrollments")
    const coursesWithCount = await Promise.all(courses.map(async (course) => {
      const enrolledCount = await enrollments.countDocuments({ courseId: course._id.toString() })
      return {
        id: course._id,
        title: course.title,
        enrolledCount: enrolledCount
      }
    }))
    
    return NextResponse.json({
      success: true,
      courses: coursesWithCount
    })
    
  } catch (error) {
    console.error('Courses list error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}