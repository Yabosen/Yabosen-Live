// Status API route for yabosen.live
// Uses simple in-memory storage (serverless compatible, non-persistent)
// Add to: app/api/status/route.ts

import { NextResponse } from 'next/server'

// Status types
export type StatusType = 'online' | 'offline' | 'dnd' | 'idle' | 'sleeping' | 'streaming'

interface StatusData {
  status: StatusType
  customMessage: string | null
  updatedAt: number
}

// Global in-memory storage (variables should be static logic)
// Note: This will reset when the serverless function cold-starts/reDeploys
// This serves the "suffer from vercel" requirement (no Redis)
let globalStatusData: StatusData = {
  status: 'offline',
  customMessage: null,
  updatedAt: Date.now(),
}

// GET - Public: Fetch current status
export async function GET() {
  try {
    return NextResponse.json(globalStatusData)
  } catch (error) {
    console.error('Failed to fetch status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}

// POST - Protected: Update status (requires API key)
export async function POST(request: Request) {
  try {
    // Verify Password
    const authHeader = request.headers.get('Authorization')
    const password = authHeader?.replace('Bearer ', '')

    // Check against ADMIN_PASSWORD from env
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Password' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, customMessage } = body

    // Validate status
    const validStatuses: StatusType[] = ['online', 'offline', 'dnd', 'idle', 'sleeping', 'streaming']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Update the static variable
    globalStatusData = {
      status,
      customMessage: customMessage || null,
      updatedAt: Date.now(),
    }

    return NextResponse.json({ success: true, ...globalStatusData })
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
