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

// Global in-memory storage using globalThis to survive hot-reloads in dev
// Note: This still resets on server restart/deployment
declare global {
  var globalStatusData: StatusData | undefined
}

if (!globalThis.globalStatusData) {
  globalThis.globalStatusData = {
    status: 'offline',
    customMessage: null,
    updatedAt: Date.now(),
  }
}

export const dynamic = 'force-dynamic'

// GET - Public: Fetch current status
export async function GET() {
  try {
    return NextResponse.json(globalThis.globalStatusData)
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

    console.log('Status Update Attempt:', { hasAuth: !!password, hasEnvPass: !!process.env.ADMIN_PASSWORD })

    // Check against ADMIN_PASSWORD from env
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      console.log('Status Update Failed: Invalid Password')
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Password' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Status Update Body:', body)

    // Normalize input
    let { status, customMessage, message } = body

    // Handle aliases and case-insensitivity
    if (typeof status === 'string') status = status.toLowerCase()
    if (!customMessage && message) customMessage = message

    // Validate status
    const validStatuses: StatusType[] = ['online', 'offline', 'dnd', 'idle', 'sleeping', 'streaming']
    if (!validStatuses.includes(status)) {
      console.log(`Status Update Failed: Invalid status '${status}'`)
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Update the static variable
    globalThis.globalStatusData = {
      status: status as StatusType,
      customMessage: customMessage || null,
      updatedAt: Date.now(),
    }

    console.log('Status Updated Successfully:', globalThis.globalStatusData)

    return NextResponse.json({ success: true, ...globalThis.globalStatusData })
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
