import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

// GET - Get single user details
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { userId } = params
    
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
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    let profile = null
    if (user.role === 'student') {
      profile = await db.collection("students").findOne({ userId: user._id.toString() })
    } else if (user.role === 'instructor') {
      profile = await db.collection("instructors").findOne({ userId: user._id.toString() })
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'Active',
        createdAt: user.createdAt,
        profile
      }
    })
    
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { userId } = params
    const body = await request.json()
    
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
    
    const updateData = {}
    if (body.name) updateData.name = body.name
    if (body.email) updateData.email = body.email
    if (body.role) updateData.role = body.role
    if (body.status) updateData.status = body.status
    
    updateData.updatedAt = new Date()
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )
    
    return NextResponse.json({
      success: true,
      message: "User updated successfully"
    })
    
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { userId } = params
    
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
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Delete role-specific profile
    if (user.role === 'student') {
      await db.collection("students").deleteOne({ userId: userId })
    } else if (user.role === 'instructor') {
      await db.collection("instructors").deleteOne({ userId: userId })
    }
    
    // Delete user
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) })
    
    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })
    
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}