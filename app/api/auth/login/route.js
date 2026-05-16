import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }
    
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    const users = db.collection("users")
    
    // Find user by email
    const user = await users.findOne({ email })
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Check password
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Get role-specific profile data
    let profile = null
    const students = db.collection("students")
    const instructors = db.collection("instructors")
    const admins = db.collection("admins")
    
    if (user.role === 'student') {
      profile = await students.findOne({ userId: user._id.toString() })
    } else if (user.role === 'instructor') {
      profile = await instructors.findOne({ userId: user._id.toString() })
    } else if (user.role === 'admin') {
      profile = await admins.findOne({ userId: user._id.toString() })
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userWithoutPassword._id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        role: userWithoutPassword.role
      },
      profile: profile ? {
        id: profile._id,
        ...(user.role === 'student' && {
          studentId: profile.studentId,
          streak: profile.streak,
          totalPoints: profile.totalPoints,
          enrolledCourses: profile.enrolledCourses?.length || 0
        }),
        ...(user.role === 'instructor' && {
          instructorId: profile.instructorId,
          totalCourses: profile.totalCourses,
          totalStudents: profile.totalStudents,
          rating: profile.rating
        }),
        ...(user.role === 'admin' && {
          adminId: profile.adminId,
          permissions: profile.permissions
        })
      } : null
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    )
  }
}