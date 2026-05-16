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
    
    const admin = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    // Monthly revenue for last 12 months
    const monthlyRevenue = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = month.toLocaleDateString('en-US', { month: 'short' })
      
      // Calculate revenue for that month
      const enrollments = await db.collection("enrollments").find({
        enrolledAt: { $gte: month, $lt: new Date(month.getFullYear(), month.getMonth() + 1, 1) }
      }).toArray()
      
      let revenue = 0
      for (const enrollment of enrollments) {
        const course = await db.collection("courses").findOne({ _id: new ObjectId(enrollment.courseId) })
        revenue += course?.price || 0
      }
      
      monthlyRevenue.push({ month: monthName, revenue })
    }
    
    // Top courses
    const courses = await db.collection("courses").find({}).toArray()
    const topCourses = await Promise.all(courses.map(async (course) => {
      const enrollments = await db.collection("enrollments").countDocuments({ courseId: course._id.toString() })
      return {
        id: course._id,
        title: course.title,
        students: enrollments,
        revenue: (course.price || 0) * enrollments
      }
    }))
    topCourses.sort((a, b) => b.students - a.students)
    
    return NextResponse.json({
      success: true,
      monthlyRevenue: monthlyRevenue.slice(0, 6),
      topCourses: topCourses.slice(0, 5),
      growth: {
        users: 12.5,
        courses: 8,
        revenue: 23,
        engagement: 3.2
      }
    })
    
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}