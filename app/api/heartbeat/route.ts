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

// POST - Heartbeat ping from the desktop app
// Updates only the `updatedAt` timestamp without changing any status fields
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

        const redis = getRedisClient()

        // Read current status data
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

        return NextResponse.json({ success: true, updatedAt: updatedData.updatedAt })
    } catch (error) {
        console.error('Heartbeat error:', error)
        return NextResponse.json(
            { error: 'Heartbeat failed' },
            { status: 500 }
        )
    }
}
