// Status API route for yabosen.live
// Add to: app/api/status/route.ts

import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Status types
export type StatusType = 'online' | 'offline' | 'dnd' | 'idle' | 'sleeping' | 'streaming'

interface StatusData {
  status: StatusType
  customMessage?: string
  updatedAt: number
}

const REDIS_KEY = 'yabosen:status'

// GET - Public: Fetch current status
export async function GET() {
  try {
    const data = await redis.get<StatusData>(REDIS_KEY)

    if (!data) {
      // Return default offline status if none set
      return NextResponse.json({
        status: 'offline',
        customMessage: null,
        updatedAt: Date.now(),
      })
    }

    return NextResponse.json(data)
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

    const statusData: StatusData = {
      status,
      customMessage: customMessage || null,
      updatedAt: Date.now(),
    }

    // Store in Redis (no expiration - status persists)
    await redis.set(REDIS_KEY, statusData)

    return NextResponse.json({ success: true, ...statusData })
  } catch (error) {
    console.error('Failed to update status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
