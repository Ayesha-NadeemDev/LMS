import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

// GET - Get all users with pagination and filters
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Check admin role
    const admin = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    // Build query
    let query = {}
    if (role && role !== 'All') {
      query.role = role.toLowerCase()
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    const total = await db.collection("users").countDocuments(query)
    const users = await db.collection("users").find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray()
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      let stats = {}
      if (user.role === 'instructor') {
        const courses = await db.collection("courses").countDocuments({ instructorId: user._id.toString() })
        stats.courses = courses
      } else if (user.role === 'student') {
        const enrollments = await db.collection("enrollments").countDocuments({ studentId: user._id.toString() })
        stats.enrollments = enrollments
      }
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'Active',
        joined: user.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        stats
      }
    }))
    
    return NextResponse.json({
      success: true,
      users: usersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
    
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new user (admin only)
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { name, email, password, role } = await request.json()
    
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
    
    // Check if user exists
    const existing = await db.collection("users").findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }
    
    const hashedPassword = await bcrypt.hash(password || 'password123', 10)
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection("users").insertOne(newUser)
    
    // Create role-specific profile
    if (role === 'student') {
      await db.collection("students").insertOne({
        userId: result.insertedId.toString(),
        studentId: `STU${Date.now()}`,
        name,
        email,
        enrolledCourses: [],
        progress: {},
        createdAt: new Date()
      })
    } else if (role === 'instructor') {
      await db.collection("instructors").insertOne({
        userId: result.insertedId.toString(),
        instructorId: `INS${Date.now()}`,
        name,
        email,
        courses: [],
        createdAt: new Date()
      })
    }
    
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: { id: result.insertedId, name, email, role }
    })
    
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}