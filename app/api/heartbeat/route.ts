import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const REDIS_KEY = 'yabosen:status'

function getRedisClient() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
        throw new Error('Redis configuration missing')
    }

    return new Redis({ url, token })
}

export const dynamic = 'force-dynamic'

// POST - Heartbeat ping from desktop or mobile app
// Updates `updatedAt` timestamp and stores per-source heartbeat
export async function POST(request: Request) {
    try {
        // Verify API Key
        const authHeader = request.headers.get('Authorization')
        const apiKey = authHeader?.replace('Bearer ', '')

        if (!apiKey || apiKey !== process.env.STATUS_API_KEY) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Parse body to get source (pc or mobile)
        const body = await request.json().catch(() => ({}))
        const source = body?.source === 'mobile' ? 'mobile' : 'pc'

        const redis = getRedisClient()

        // Store per-source heartbeat timestamp
        await redis.set(`yabosen:heartbeat:${source}`, Date.now())

        // Also update the main status updatedAt
        const currentData = await redis.get<Record<string, unknown>>(REDIS_KEY)

        if (!currentData) {
            return NextResponse.json(
                { error: 'No status data found' },
                { status: 404 }
            )
        }

        // Only update the timestamp — preserve everything else
        const updatedData = {
            ...currentData,
            updatedAt: Date.now(),
        }

        await redis.set(REDIS_KEY, updatedData)

        return NextResponse.json({ success: true, source, updatedAt: updatedData.updatedAt })
    } catch (error) {
        console.error('Heartbeat error:', error)
        return NextResponse.json(
            { error: 'Heartbeat failed' },
            { status: 500 }
        )
    }
}
