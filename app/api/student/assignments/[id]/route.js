import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

// GET - Fetch all assignments for a student
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // For now, return dummy data (will connect to DB later)
    const dummyAssignments = [
      {
        id: "1",
        title: "React Components Assignment",
        description: "Create a reusable React component library with at least 5 components.",
        course: "Web Development Bootcamp",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        score: null,
        submittedAt: null,
        feedback: null
      },
      {
        id: "2",
        title: "Python Functions Exercise",
        description: "Write 10 Python functions covering loops, conditionals, and data structures.",
        course: "Python for Data Science",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        score: null,
        submittedAt: null,
        feedback: null
      },
      {
        id: "3",
        title: "Figma Design Project",
        description: "Create a complete mobile app design in Figma.",
        course: "UI/UX Design Fundamentals",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "submitted",
        score: null,
        submittedAt: new Date().toISOString(),
        feedback: null
      }
    ]
    
    return NextResponse.json({
      success: true,
      assignments: dummyAssignments
    })
    
  } catch (error) {
    console.error('Assignments API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Add new assignment
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // For now, just return success (will connect to DB later)
    console.log('New assignment received:', body)
    
    return NextResponse.json({
      success: true,
      message: "Assignment added successfully",
      assignment: {
        id: Date.now().toString(),
        ...body,
        status: "pending",
        createdAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Add assignment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove assignment
export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 })
    }
    
    console.log('Delete assignment:', assignmentId)
    
    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully"
    })
    
  } catch (error) {
    console.error('Delete assignment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}