import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }
    
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    const users = db.collection("users")
    
    // Find user by ID (exclude password)
    const user = await users.findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } }
    )
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    })
    
  } catch (error) {
    console.error('Me endpoint error:', error)
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    )
  }
}