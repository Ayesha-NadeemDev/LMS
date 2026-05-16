import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json();
    const { assignmentId, submissionText } = body;
    
    if (!assignmentId) {
      return NextResponse.json({ success: false, error: "Assignment ID required" }, { status: 400 });
    }
    
    // Access global assignments
    const assignments = global.assignments || [];
    const index = assignments.findIndex(a => a.id === assignmentId);
    
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }
    
    // Update the assignment
    assignments[index] = {
      ...assignments[index],
      status: 'submitted',
      submissionText: submissionText,
      submittedAt: new Date().toISOString()
    };
    
    global.assignments = assignments;
    
    return NextResponse.json({ success: true, message: "Submitted!" });
    
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}