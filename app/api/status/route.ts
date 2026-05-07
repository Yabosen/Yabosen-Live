import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import type { SleepSchedule } from '../sleep-schedule/route'
import { SCHEDULE_KEY } from '../sleep-schedule/route'

export type StatusType = 'online' | 'offline' | 'dnd' | 'idle' | 'sleeping' | 'streaming'
export type ActivityType = 'playing' | 'watching' | 'listening' | null

interface StatusData {
  status: StatusType
  customMessage: string | null
  activityType: ActivityType
  activityName: string | null
  episodeInfo: string | null
  seasonInfo: string | null
  updatedAt: number
  startedAt?: number
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

// Staleness threshold: 3 minutes (in milliseconds).
// Heartbeat interval is 60s, so this gives ~3 attempts before flipping —
// resilient to one missed/delayed beat (e.g. Android Doze).
const STALENESS_THRESHOLD_MS = 3 * 60 * 1000

// Schedule eval — uses Europe/Bucharest local time so DST is handled
// automatically (GMT+3 in summer, GMT+2 in winter).
function bucharestMinutes(now: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Bucharest',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(now))
  const h = parseInt(parts.find(p => p.type === 'hour')!.value, 10)
  const m = parseInt(parts.find(p => p.type === 'minute')!.value, 10)
  return h * 60 + m
}

function inSleepWindow(now: number, sleepy: string, wakey: string): boolean {
  const cur = bucharestMinutes(now)
  const [sh, sm] = sleepy.split(':').map(Number)
  const [wh, wm] = wakey.split(':').map(Number)
  const sleepyMin = sh * 60 + sm
  const wakeyMin = wh * 60 + wm
  if (sleepyMin <= wakeyMin) {
    // same-day window (rare — e.g. afternoon nap 13:00–15:00)
    return cur >= sleepyMin && cur < wakeyMin
  }
  // overnight window — e.g. 23:00 → 07:00
  return cur >= sleepyMin || cur < wakeyMin
}

// GET - Public: Fetch current status
// Pass ?debug=1 to also see raw heartbeat ages (for diagnosing idle-override issues)
export async function GET(request: Request) {
  try {
    const redis = getRedisClient()
    let status = await readStatus()
    const debug = new URL(request.url).searchParams.get('debug') === '1'

    // Check per-source heartbeat freshness up-front so debug always returns it
    const [pcHeartbeat, mobileHeartbeat, schedule] = await Promise.all([
      redis.get<number>('yabosen:heartbeat:pc'),
      redis.get<number>('yabosen:heartbeat:mobile'),
      redis.get<SleepSchedule>(SCHEDULE_KEY),
    ])

    const now = Date.now()
    const pcAlive = pcHeartbeat != null && (now - pcHeartbeat) < STALENESS_THRESHOLD_MS
    const mobileAlive = mobileHeartbeat != null && (now - mobileHeartbeat) < STALENESS_THRESHOLD_MS

    // Sleep schedule: lazily flip stored status based on the time-of-day window.
    //   - Auto-Sleep at sleepyTime: only if PC is not alive AND status is in
    //     {online, idle} (i.e., user hasn't manually picked DND/Streaming/Offline/etc).
    //   - Auto-Wake at wakeyTime: if status is sleeping, revert to online.
    // Writes are idempotent — only happen when the resulting status would change.
    if (schedule?.enabled) {
      const inWindow = inSleepWindow(now, schedule.sleepyTime, schedule.wakeyTime)
      if (inWindow && !pcAlive && (status.status === 'online' || status.status === 'idle')) {
        const flipped: StatusData = { ...status, status: 'sleeping', updatedAt: now }
        await writeStatus(flipped)
        status = flipped
      } else if (!inWindow && status.status === 'sleeping') {
        const flipped: StatusData = { ...status, status: 'online', updatedAt: now }
        await writeStatus(flipped)
        status = flipped
      }
    }

    const debugInfo = debug ? {
      _debug: {
        storedStatus: status.status,
        pcHeartbeatTs: pcHeartbeat,
        pcHeartbeatAgeMs: pcHeartbeat != null ? now - pcHeartbeat : null,
        pcAlive,
        mobileHeartbeatTs: mobileHeartbeat,
        mobileHeartbeatAgeMs: mobileHeartbeat != null ? now - mobileHeartbeat : null,
        mobileAlive,
        stalenessThresholdMs: STALENESS_THRESHOLD_MS,
        now,
        bucharestNowMin: bucharestMinutes(now),
        schedule,
        inSleepWindow: schedule?.enabled
          ? inSleepWindow(now, schedule.sleepyTime, schedule.wakeyTime)
          : null,
      }
    } : {}

    // If status is offline or sleeping, skip staleness logic
    if (status.status === 'offline' || status.status === 'sleeping') {
      return NextResponse.json({ ...status, ...debugInfo })
    }

    // PC alive → keep current status (Online, DND, Streaming, etc.)
    if (pcAlive) {
      return NextResponse.json({ ...status, ...debugInfo })
    }

    // PC stale → idle override, regardless of phone. Activity fields are
    // dropped because "idle but still streaming X" is nonsense. To go to
    // offline, the user must manually click it (it short-circuits above).
    return NextResponse.json({
      ...status,
      status: 'idle' as StatusType,
      activityType: null,
      activityName: null,
      episodeInfo: null,
      seasonInfo: null,
      ...debugInfo,
    })
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
    if (activityType && activityType !== 'playing' && activityType !== 'watching' && activityType !== 'listening') {
      console.log(`❌ Invalid activity type: ${activityType}`)
      return NextResponse.json(
        { error: 'Invalid activity type. Must be "playing", "watching", or "listening"' },
        { status: 400 }
      )
    }

    // Retrieve current status to check for changes
    const currentStatus = await readStatus()
    let startedAt = Date.now()

    // Check if the activity is the same
    // We consider it the same if:
    // 1. Status is the same
    // 2. Activity Type is the same
    // 3. Activity Name is the same
    // If it's the same, we keep the old startedAt
    if (
      currentStatus.status === status &&
      currentStatus.activityType === (activityType || null) &&
      currentStatus.activityName === (activityName || null) &&
      currentStatus.startedAt
    ) {
      startedAt = currentStatus.startedAt
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
      startedAt
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
