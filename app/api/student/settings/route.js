import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// In-memory storage for demo (in production, use database)
let studentProfile = {
  id: "student_001",
  name: "Test Student",
  email: "test@example.com",
  avatar: "👨‍🎓",
  bio: "Passionate learner interested in web development and AI.",
  phone: "+92 300 1234567",
  location: "Karachi, Pakistan",
  joinDate: "2024-01-15",
  role: "student",
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: "English"
  }
}

// GET - Fetch student profile (returns UPDATED data)
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Return current profile from memory
    return NextResponse.json({ 
      success: true, 
      profile: studentProfile 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update profile (updates memory storage)
export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const { type, data } = body
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    let message = ""
    
    switch(type) {
      case "profile":
        // Update profile fields
        studentProfile = {
          ...studentProfile,
          name: data.name || studentProfile.name,
          bio: data.bio || studentProfile.bio,
          phone: data.phone || studentProfile.phone,
          location: data.location || studentProfile.location,
          avatar: data.avatar || studentProfile.avatar
        }
        message = "Profile updated successfully"
        break
        
      case "password":
        // In production, hash password and save to DB
        message = "Password updated successfully"
        break
        
      case "preferences":
        // Update preferences
        studentProfile.preferences = {
          ...studentProfile.preferences,
          ...data
        }
        message = "Preferences updated successfully"
        break
        
      default:
        message = "Settings updated successfully"
    }
    
    // Return updated profile
    return NextResponse.json({ 
      success: true, 
      message: message,
      profile: studentProfile  // ← Return updated data
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}