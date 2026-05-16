// app/api/student/courses/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
export const dynamic = 'force-dynamic'
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "lms");
    
    // Get student profile
    const student = await db.collection("students").findOne({ userId: decoded.id });
    
    if (!student) {
      return NextResponse.json({ 
        success: true, 
        courses: [] 
      });
    }
    
    const enrolledCourseIds = student.enrolledCourses || [];
    const courses = [];
    
    // Fetch each course details
    for (const courseId of enrolledCourseIds) {
      const course = await db.collection("courses").findOne({ 
        _id: new ObjectId(courseId) 
      });
      
      if (course) {
        courses.push({
          id: course._id.toString(),
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          instructor: course.instructorName || "Expert Instructor",
          progress: student.progress?.[courseId] || 0,
          totalLessons: course.lessons?.length || 0,
          completedLessons: Math.floor(((student.progress?.[courseId] || 0) / 100) * (course.lessons?.length || 0)),
          completedHours: student.completedHours?.[courseId] || 0,
          lastAccessed: student.lastAccessed?.[courseId] || null
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      courses: courses
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}