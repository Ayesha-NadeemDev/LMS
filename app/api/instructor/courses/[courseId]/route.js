import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

// GET - Get single course details
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { courseId } = params
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    const course = await db.collection("courses").findOne({ _id: new ObjectId(courseId) })
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    
    // Check if instructor owns this course
    if (course.instructorId !== decoded.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    // Get enrollment count
    const enrollments = db.collection("enrollments")
    const enrollmentCount = await enrollments.countDocuments({ courseId: courseId })
    
    return NextResponse.json({
      success: true,
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        duration: course.duration,
        price: course.price,
        isPublished: course.isPublished || false,
        status: course.isPublished ? 'published' : 'draft',
        students: enrollmentCount,
        rating: course.rating || 0,
        lessons: course.lessons?.length || 0,
        createdAt: course.createdAt
      }
    })
    
  } catch (error) {
    console.error('Course details error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update course
export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { courseId } = params
    const body = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    const course = await db.collection("courses").findOne({ _id: new ObjectId(courseId) })
    
    if (!course || course.instructorId !== decoded.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    const updateData = {
      title: body.title || course.title,
      description: body.description || course.description,
      price: body.price !== undefined ? body.price : course.price,
      duration: body.duration || course.duration,
      level: body.level || course.level,
      category: body.category || course.category,
      isPublished: body.isPublished !== undefined ? body.isPublished : course.isPublished,
      updatedAt: new Date()
    }
    
    await db.collection("courses").updateOne(
      { _id: new ObjectId(courseId) },
      { $set: updateData }
    )
    
    return NextResponse.json({
      success: true,
      message: "Course updated successfully"
    })
    
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete course
export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { courseId } = params
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    const course = await db.collection("courses").findOne({ _id: new ObjectId(courseId) })
    
    if (!course || course.instructorId !== decoded.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    // Delete all enrollments for this course
    await db.collection("enrollments").deleteMany({ courseId: courseId })
    
    // Delete the course
    await db.collection("courses").deleteOne({ _id: new ObjectId(courseId) })
    
    return NextResponse.json({
      success: true,
      message: "Course deleted successfully"
    })
    
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}