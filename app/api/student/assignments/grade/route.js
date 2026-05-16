import { NextResponse } from 'next/server'

let studentAssignments = [];

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { assignmentId, score, feedback } = body
    
    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 })
    }
    
    const index = studentAssignments.findIndex(a => a.id === assignmentId && a.studentId === token);
    
    if (index === -1) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }
    
    studentAssignments[index] = {
      ...studentAssignments[index],
      status: 'graded',
      score: parseFloat(score),
      feedback: feedback || '',
      gradedAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      message: "Assignment graded successfully"
    })
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}