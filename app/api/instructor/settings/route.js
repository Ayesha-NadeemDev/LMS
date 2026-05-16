import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// GET - Fetch all instructor settings
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    // Get user
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
    
    if (!user || user.role !== 'instructor') {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    
    // Get or create instructor settings
    let settings = await db.collection("instructor_settings").findOne({ userId: decoded.id })
    
    if (!settings) {
      const defaultSettings = {
        userId: decoded.id,
        profile: {
          fullName: user.name,
          email: user.email,
          username: user.email?.split('@')[0],
          bio: '',
          title: '',
          location: '',
          website: '',
          phone: ''
        },
        notifications: {
          newEnrollment: true,
          courseReviews: true,
          newMessages: true,
          studentQuestions: true,
          assignmentSubmissions: true,
          platformUpdates: false,
          marketingEmails: false,
          notificationSound: true
        },
        appearance: {
          theme: 'light',
          fontSize: 'medium',
          animations: true,
          reducedMotion: false,
          highContrast: false,
          sidebarCollapsed: false
        },
        billing: {
          payoutMethod: 'bank_transfer',
          bankAccount: '',
          taxId: '',
          payoutThreshold: 100
        },
        privacy: {
          profileVisibility: 'public',
          showEmailToStudents: true,
          allowDirectMessages: true,
          showStudentProgress: true
        },
        integrations: {
          linkedin: '',
          twitter: '',
          github: '',
          facebook: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await db.collection("instructor_settings").insertOne(defaultSettings)
      settings = await db.collection("instructor_settings").findOne({ _id: result.insertedId })
    }
    
    return NextResponse.json({
      success: true,
      settings: {
        profile: settings.profile,
        notifications: settings.notifications,
        appearance: settings.appearance,
        billing: settings.billing,
        privacy: settings.privacy,
        integrations: settings.integrations
      }
    })
    
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update settings
export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const { type, data } = body
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || "lms")
    
    const updateData = {}
    
    switch(type) {
      case 'profile':
        updateData['profile'] = data
        // Also update users collection name
        if (data.fullName) {
          await db.collection("users").updateOne(
            { _id: new ObjectId(decoded.id) },
            { $set: { name: data.fullName, updatedAt: new Date() } }
          )
        }
        break
      case 'notifications':
        updateData['notifications'] = data
        break
      case 'appearance':
        updateData['appearance'] = data
        break
      case 'billing':
        updateData['billing'] = data
        break
      case 'privacy':
        updateData['privacy'] = data
        break
      case 'integrations':
        updateData['integrations'] = data
        break
      default:
        return NextResponse.json({ error: "Invalid update type" }, { status: 400 })
    }
    
    updateData['updatedAt'] = new Date()
    
    await db.collection("instructor_settings").updateOne(
      { userId: decoded.id },
      { $set: updateData }
    )
    
    return NextResponse.json({
      success: true,
      message: `${type} settings updated successfully`
    })
    
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}