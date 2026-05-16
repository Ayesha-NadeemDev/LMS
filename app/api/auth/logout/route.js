// Enhanced logout with token blacklist
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Store blacklisted tokens (in production, use Redis)
const blacklistedTokens = new Set()

export async function POST(request) {
  try {
    // Get token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (token) {
      // Add token to blacklist
      blacklistedTokens.add(token)
      
      // Optional: Store in database with expiry
      // const client = await clientPromise
      // const db = client.db(process.env.DB_NAME || "lms")
      // const blacklist = db.collection("token_blacklist")
      // await blacklist.insertOne({ 
      //   token, 
      //   createdAt: new Date(),
      //   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      // })
    }
    
    return NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Middleware to check blacklisted tokens
export function isTokenBlacklisted(token) {
  return blacklistedTokens.has(token)
}