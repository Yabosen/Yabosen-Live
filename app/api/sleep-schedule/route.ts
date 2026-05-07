import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

export interface SleepSchedule {
    enabled: boolean
    sleepyTime: string // "HH:mm" in Europe/Bucharest local
    wakeyTime: string  // "HH:mm" in Europe/Bucharest local
}

export const SCHEDULE_KEY = 'yabosen:sleep_schedule'

function getRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) throw new Error('Redis configuration missing')
    return new Redis({ url, token })
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

function isValidTime(t: unknown): t is string {
    return typeof t === 'string' && TIME_RE.test(t)
}

// GET — public: returns current schedule (or sensible defaults)
export async function GET() {
    try {
        const data = await getRedis().get<SleepSchedule>(SCHEDULE_KEY)
        return NextResponse.json(data ?? {
            enabled: false,
            sleepyTime: '23:00',
            wakeyTime: '07:00',
        })
    } catch (err) {
        console.error('Sleep schedule GET error:', err)
        return NextResponse.json({ error: 'Failed to read schedule' }, { status: 500 })
    }
}

// POST — auth'd: replaces the schedule
export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!apiKey || apiKey !== process.env.STATUS_API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json().catch(() => ({}))
        if (typeof body?.enabled !== 'boolean') {
            return NextResponse.json({ error: '`enabled` must be boolean' }, { status: 400 })
        }
        if (!isValidTime(body.sleepyTime) || !isValidTime(body.wakeyTime)) {
            return NextResponse.json(
                { error: '`sleepyTime` and `wakeyTime` must match HH:mm' },
                { status: 400 }
            )
        }

        const schedule: SleepSchedule = {
            enabled: body.enabled,
            sleepyTime: body.sleepyTime,
            wakeyTime: body.wakeyTime,
        }
        await getRedis().set(SCHEDULE_KEY, schedule)
        return NextResponse.json({ success: true, ...schedule })
    } catch (err) {
        console.error('Sleep schedule POST error:', err)
        return NextResponse.json({ error: 'Failed to write schedule' }, { status: 500 })
    }
}
