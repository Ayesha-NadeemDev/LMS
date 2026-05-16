import { NextResponse } from 'next/server'

export async function GET() {
  const certificates = [
    {
      id: "1",
      title: "Web Development Bootcamp",
      studentName: "Test Student",
      issueDate: "2024-12-15",
      grade: "A",
      score: 92,
      skills: ["HTML", "CSS", "JavaScript", "React", "Node.js"]
    },
    {
      id: "2",
      title: "UI/UX Design Mastery",
      studentName: "Test Student",
      issueDate: "2024-12-10",
      grade: "A-",
      score: 88,
      skills: ["Figma", "Wireframing", "Prototyping", "User Research"]
    },
    {
      id: "3",
      title: "Python for Data Science",
      studentName: "Test Student",
      issueDate: "2024-12-05",
      grade: "B+",
      score: 78,
      skills: ["Python", "Pandas", "NumPy", "Data Visualization"]
    }
  ]
  
  return NextResponse.json({ 
    success: true, 
    certificates: certificates,
    total: certificates.length
  })
}