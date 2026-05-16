import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { currentPassword, newPassword } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    )
    
    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    })
    
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}