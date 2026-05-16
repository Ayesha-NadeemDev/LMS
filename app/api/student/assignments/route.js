import { NextResponse } from 'next/server'

// Shared storage - this will be used by both routes
global.assignments = global.assignments || [];

export async function GET() {
  const assignments = global.assignments || [];
  
  const pending = assignments.filter(a => a.status === 'pending');
  const submitted = assignments.filter(a => a.status === 'submitted');
  const graded = assignments.filter(a => a.status === 'graded');
  
  return NextResponse.json({
    success: true,
    stats: {
      total: assignments.length,
      pending: pending.length,
      submitted: submitted.length,
      graded: graded.length,
      overdue: 0,
      averageScore: 0
    },
    assignments: { pending, submitted, graded, overdue: [] }
  });
}

export async function POST(request) {
  const body = await request.json();
  const { title, description, course, dueDate } = body;
  
  const newAssignment = {
    id: Date.now().toString(),
    title,
    description: description || '',
    course,
    dueDate,
    status: 'pending',
    score: null,
    feedback: '',
    submittedAt: null,
    createdAt: new Date().toISOString()
  };
  
  global.assignments.push(newAssignment);
  
  return NextResponse.json({ success: true, assignment: newAssignment });
}

export async function PUT(request) {
  const { id, title, description, course, dueDate } = await request.json();
  const index = global.assignments.findIndex(a => a.id === id);
  
  if (index !== -1) {
    global.assignments[index] = { ...global.assignments[index], title, description, course, dueDate };
  }
  
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  global.assignments = global.assignments.filter(a => a.id !== id);
  return NextResponse.json({ success: true });
}