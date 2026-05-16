// backend/app/api/instructor/courses/route.js
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

// ✅ GET - Fetch all courses for instructor
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
    const coursesWithDetails = await Promise.all(courses.map(async (course) => {
      const enrolledCount = await enrollments.countDocuments({ courseId: course._id.toString() })
      
      return {
        id: course._id.toString(),
        title: course.title,
        description: course.description || '',
        thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=240&fit=crop',
        price: course.price || 0,
        duration: course.duration || 'Not specified',
        level: course.level || 'Beginner',
        category: course.category || 'Development',
        status: course.isPublished ? 'published' : 'draft',
        students: enrolledCount,
        rating: course.rating || 0,
        ratingCount: course.ratingCount || 0,
        lessons: course.lessons?.length || 0,
        quizzes: course.quizzes?.length || 0,
        resources: course.resources?.length || 0,
        lastUpdated: course.updatedAt || course.createdAt || new Date(),
        createdAt: course.createdAt
      }
    }))
    
    // Calculate stats
    const stats = {
      totalCourses: coursesWithDetails.length,
      totalStudents: coursesWithDetails.reduce((sum, c) => sum + (c.students || 0), 0),
      totalRevenue: coursesWithDetails.reduce((sum, c) => sum + ((c.price || 0) * (c.students || 0)), 0),
      avgRating: coursesWithDetails.reduce((sum, c) => sum + (c.rating || 0), 0) / (coursesWithDetails.length || 1)
    }
    
    return NextResponse.json({
      success: true,
      courses: coursesWithDetails,
      stats: stats
    })
    
  } catch (error) {
    console.error('GET courses error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ✅ POST - Create new course (YEH ADD KARO - YAHI MISSING THA)
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const body = await request.json()
    
    console.log('📥 Creating course with data:', body)
    
    const { title, description, category, level, duration, price, thumbnail } = body
    
    // Validation
    if (!title || !description) {
      return NextResponse.json({ 
        error: "Title and description are required" 
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Create new course
    const newCourse = {
      title,
      description,
      category: category || 'Development',
      level: level || 'Beginner',
      duration: duration || 'Not specified',
      price: parseFloat(price) || 0,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=240&fit=crop',
      instructorId: decoded.id,
      isPublished: false,
      rating: 0,
      ratingCount: 0,
      lessons: [],
      quizzes: [],
      resources: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection("courses").insertOne(newCourse)
    
    console.log('✅ Course created with ID:', result.insertedId)
    
    return NextResponse.json({
      success: true,
      course: {
        id: result.insertedId.toString(),
        title: newCourse.title,
        description: newCourse.description,
        thumbnail: newCourse.thumbnail,
        price: newCourse.price,
        duration: newCourse.duration,
        level: newCourse.level,
        category: newCourse.category,
        status: 'draft',
        students: 0,
        rating: 0,
        lessons: 0,
        quizzes: 0,
        resources: 0,
        lastUpdated: newCourse.createdAt
      },
      message: "Course created successfully"
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ POST course error:', error)
    return NextResponse.json({ 
      error: error.message || "Failed to create course" 
    }, { status: 500 })
  }
}