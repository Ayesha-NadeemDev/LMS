import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { type, imageUrl } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    const updateData = {}
    
    if (type === 'profile') {
      updateData['profile.avatar'] = imageUrl
    } else if (type === 'cover') {
      updateData['profile.coverImage'] = imageUrl
    }
    
    if (Object.keys(updateData).length > 0) {
      await db.collection("instructor_settings").updateOne(
        { userId: decoded.id },
        { $set: updateData }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `${type} image updated successfully`
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}