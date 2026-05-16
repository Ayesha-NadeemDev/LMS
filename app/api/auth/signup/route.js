// app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();
    
    // Validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "lms");
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    
    // ✅ CHECK ADMIN LIMIT (Only 2 admins allowed)
    if (role === 'admin') {
      const adminCount = await db.collection("users").countDocuments({ role: 'admin' });
      
      if (adminCount >= 2) {
        return NextResponse.json({ 
          error: "Maximum 2 admin accounts allowed. Cannot create more admins." 
        }, { status: 403 });
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      email,
      password: hashedPassword,
      name,
      role: role || 'student',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection("users").insertOne(newUser);
    
    // Create profile based on role
    if (role === 'student') {
      await db.collection("students").insertOne({
        userId: result.insertedId.toString(),
        studentId: `STU${Date.now()}`,
        name: name,
        email: email,
        enrolledCourses: [],
        progress: {},
        achievements: [],
        streak: 0,
        totalPoints: 0,
        totalHours: 0,
        completedCourses: 0,
        createdAt: new Date()
      });
    } else if (role === 'instructor') {
      await db.collection("instructors").insertOne({
        userId: result.insertedId.toString(),
        instructorId: `INS${Date.now()}`,
        name: name,
        email: email,
        courses: [],
        students: [],
        totalEarnings: 0,
        rating: 0,
        createdAt: new Date()
      });
    } else if (role === 'admin') {
      // Get current admin count for response
      const adminCount = await db.collection("users").countDocuments({ role: 'admin' });
      
      await db.collection("admins").insertOne({
        userId: result.insertedId.toString(),
        adminId: `ADM${Date.now()}`,
        name: name,
        email: email,
        permissions: ['all'],
        createdAt: new Date()
      });
      
      // Return admin count info
      const remainingSlots = 2 - adminCount - 1;
      
      return NextResponse.json({
        success: true,
        user: {
          id: result.insertedId,
          email,
          name,
          role
        },
        token: jwt.sign(
          { id: result.insertedId.toString(), email, role },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        ),
        adminInfo: {
          totalAdmins: adminCount + 1,
          remainingSlots: remainingSlots,
          maxAdmins: 2
        }
      }, { status: 201 });
    }
    
    // Generate token for non-admin users
    const token = jwt.sign(
      { id: result.insertedId.toString(), email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    return NextResponse.json({
      success: true,
      user: {
        id: result.insertedId,
        email,
        name,
        role
      },
      token
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}