import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

// DELETE - Delete instructor account and all associated data
export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const userId = decoded.id
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // 1. Delete user from users collection
    const userResult = await db.collection("users").deleteOne({ _id: new ObjectId(userId) })
    
    if (userResult.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // 2. Delete instructor settings
    await db.collection("instructor_settings").deleteOne({ userId: userId })
    
    // 3. Get all courses by this instructor
    const courses = await db.collection("courses").find({ instructorId: userId }).toArray()
    const courseIds = courses.map(c => c._id.toString())
    
    // 4. Delete all courses by this instructor
    if (courseIds.length > 0) {
      await db.collection("courses").deleteMany({ instructorId: userId })
      
      // 5. Delete all enrollments for these courses
      await db.collection("enrollments").deleteMany({ 
        courseId: { $in: courseIds } 
      })
    }
    
    // 6. Delete all assignments for these courses
    if (courseIds.length > 0) {
      await db.collection("assignments").deleteMany({ 
        courseId: { $in: courseIds } 
      })
    }
    
    // 7. Delete all notifications for this user
    await db.collection("notifications").deleteMany({ userId: userId })
    
    // 8. Delete all certificates (if any)
    await db.collection("certificates").deleteMany({ userId: userId })
    
    return NextResponse.json({
      success: true,
      message: "Account and all associated data deleted successfully",
      deleted: {
        user: userResult.deletedCount,
        courses: courseIds.length,
        enrollments: "deleted"
      }
    })
    
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}