import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

// GET - Download specific certificate
export async function GET(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Get certificate
    const certificates = db.collection("certificates")
    const certificate = await certificates.findOne({
      _id: new ObjectId(id),
      studentId: decoded.id
    })
    
    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      )
    }
    
    // Get course details
    const courses = db.collection("courses")
    const course = await courses.findOne({ _id: new ObjectId(certificate.courseId) })
    
    // Get student details
    const users = db.collection("users")
    const user = await users.findOne({ _id: new ObjectId(decoded.id) })
    
    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate._id,
        certificateId: certificate.certificateId,
        courseName: course?.title,
        studentName: user?.name,
        studentEmail: user?.email,
        issuedAt: certificate.issuedAt,
        grade: certificate.grade,
        score: certificate.score,
        certificateUrl: certificate.certificateUrl
      }
    })
    
  } catch (error) {
    console.error('Certificate Detail Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}