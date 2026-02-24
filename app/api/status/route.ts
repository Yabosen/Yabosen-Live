import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export type StatusType = 'online' | 'offline' | 'dnd' | 'idle' | 'sleeping' | 'streaming'
export type ActivityType = 'playing' | 'watching' | null

interface StatusData {
  status: StatusType
  customMessage: string | null
  activityType: ActivityType
  activityName: string | null
  episodeInfo: string | null
  seasonInfo: string | null
  updatedAt: number
}

const REDIS_KEY = 'yabosen:status'

// Initialize Redis client
function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  console.log('Redis config check:', {
    hasUrl: !!url,
    hasToken: !!token,
    urlPrefix: url?.substring(0, 20)
  })

  if (!url || !token) {
    throw new Error('Redis configuration missing. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
  }

  return new Redis({
    url,
    token,
  })
}

// Read status from Redis
async function readStatus(): Promise<StatusData> {
  try {
    const redis = getRedisClient()
    const data = await redis.get<StatusData>(REDIS_KEY)

    if (data) {
      return data
    }

    // Return default if no data exists
    const defaultStatus: StatusData = {
      status: 'offline',
      customMessage: null,
      activityType: null,
      activityName: null,
      episodeInfo: null,
      seasonInfo: null,
      updatedAt: Date.now(),
    }

    // Save default to Redis
    await redis.set(REDIS_KEY, defaultStatus)

    return defaultStatus
  } catch (error) {
    console.error('Redis read error:', error)
    // Fallback to offline status if Redis fails
    return {
      status: 'offline',
      customMessage: null,
      activityType: null,
      activityName: null,
      episodeInfo: null,
      seasonInfo: null,
      updatedAt: Date.now(),
    }
  }
}

// Write status to Redis
async function writeStatus(data: StatusData): Promise<void> {
  try {
    const redis = getRedisClient()
    console.log('Attempting to write to Redis:', { key: REDIS_KEY, data })
    const result = await redis.set(REDIS_KEY, data)
    console.log('Redis write result:', result)
  } catch (error) {
    console.error('Redis write error details:', error)
    throw error
  }
}

export const dynamic = 'force-dynamic'

// Staleness threshold: 2 minutes (in milliseconds)
const STALENESS_THRESHOLD_MS = 2 * 60 * 1000

// GET - Public: Fetch current status
export async function GET() {
  try {
    const status = await readStatus()

    // If the desktop app hasn't sent a heartbeat in 2+ minutes,
    // treat the user as offline (skip if already offline or sleeping)
    if (
      status.status !== 'offline' &&
      status.status !== 'sleeping' &&
      Date.now() - status.updatedAt > STALENESS_THRESHOLD_MS
    ) {
      return NextResponse.json({
        ...status,
        status: 'offline' as StatusType,
        activityType: null,
        activityName: null,
        episodeInfo: null,
        seasonInfo: null,
      })
    }

    return NextResponse.json(status)
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
    console.log('=== STATUS UPDATE REQUEST ===')

    // Verify API Key
    const authHeader = request.headers.get('Authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    console.log('Auth check:', {
      hasAuthHeader: !!authHeader,
      hasApiKey: !!apiKey,
      hasEnvKey: !!process.env.STATUS_API_KEY,
      keysMatch: apiKey === process.env.STATUS_API_KEY
    })

    if (!apiKey || apiKey !== process.env.STATUS_API_KEY) {
      console.log('❌ Auth failed')
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API Key' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)

    // Normalize input
    let { status, customMessage, message, activityType, activityName, episodeInfo, seasonInfo } = body

    // Handle aliases and case-insensitivity
    if (typeof status === 'string') status = status.toLowerCase()
    if (!customMessage && message) customMessage = message
    if (typeof activityType === 'string') activityType = activityType.toLowerCase()

    // Validate status
    const validStatuses: StatusType[] = ['online', 'offline', 'dnd', 'idle', 'sleeping', 'streaming']
    if (!validStatuses.includes(status)) {
      console.log(`❌ Invalid status: ${status}`)
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Validate activity type if provided
    if (activityType && activityType !== 'playing' && activityType !== 'watching') {
      console.log(`❌ Invalid activity type: ${activityType}`)
      return NextResponse.json(
        { error: 'Invalid activity type. Must be "playing" or "watching"' },
        { status: 400 }
      )
    }

    // Update and persist status
    const newStatus: StatusData = {
      status: status as StatusType,
      customMessage: customMessage || null,
      activityType: activityType || null,
      activityName: activityName || null,
      episodeInfo: episodeInfo || null,
      seasonInfo: seasonInfo || null,
      updatedAt: Date.now(),
    }

    console.log('Writing to Redis:', newStatus)
    await writeStatus(newStatus)
    console.log('✅ Status updated successfully')

    return NextResponse.json({ success: true, ...newStatus })
  } catch (error) {
    console.error('❌ Failed to update status:', error)
    return NextResponse.json(
      { error: 'Failed to update status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
