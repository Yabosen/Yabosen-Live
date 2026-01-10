import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const REDIS_KEY = 'yabosen:avatar'
const DEFAULT_AVATAR = '/emo-avatar.png'

// Initialize Redis client
function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error('Redis configuration missing')
  }

  return new Redis({ url, token })
}

export const dynamic = 'force-dynamic'

// GET - Public: Fetch current avatar as image
export async function GET() {
  try {
    const redis = getRedisClient()
    const base64Data = await redis.get<string>(REDIS_KEY)

    if (base64Data) {
      // Decode base64 and return as image
      // Base64 data should be in format: data:image/png;base64,xxxx
      const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
      
      if (matches) {
        const mimeType = `image/${matches[1]}`
        const imageBuffer = Buffer.from(matches[2], 'base64')
        
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          },
        })
      }
    }

    // If no avatar in Redis, redirect to default
    return NextResponse.redirect(new URL(DEFAULT_AVATAR, process.env.NEXT_PUBLIC_BASE_URL || 'https://yabosen.live'))
  } catch (error) {
    console.error('Failed to fetch avatar:', error)
    // On error, redirect to default avatar
    return NextResponse.redirect(new URL(DEFAULT_AVATAR, process.env.NEXT_PUBLIC_BASE_URL || 'https://yabosen.live'))
  }
}

// POST - Protected: Update avatar (requires API key)
export async function POST(request: Request) {
  try {
    // Verify API Key
    const authHeader = request.headers.get('Authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    if (!apiKey || apiKey !== process.env.STATUS_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API Key' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { avatar } = body

    if (!avatar || typeof avatar !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid avatar data. Expected base64 string.' },
        { status: 400 }
      )
    }

    // Validate it's a valid base64 data URL
    if (!avatar.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Avatar must be a base64 data URL starting with "data:image/"' },
        { status: 400 }
      )
    }

    // Check size (limit to ~500KB to stay within free tier limits)
    const sizeInBytes = Buffer.from(avatar.split(',')[1] || '', 'base64').length
    const maxSize = 500 * 1024 // 500KB
    
    if (sizeInBytes > maxSize) {
      return NextResponse.json(
        { error: `Avatar too large. Max size is 500KB, received ${Math.round(sizeInBytes / 1024)}KB` },
        { status: 400 }
      )
    }

    // Store in Redis
    const redis = getRedisClient()
    await redis.set(REDIS_KEY, avatar)

    console.log(`✅ Avatar updated (${Math.round(sizeInBytes / 1024)}KB)`)

    return NextResponse.json({ 
      success: true, 
      message: 'Avatar updated successfully',
      size: `${Math.round(sizeInBytes / 1024)}KB`
    })
  } catch (error) {
    console.error('❌ Failed to update avatar:', error)
    return NextResponse.json(
      { error: 'Failed to update avatar', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
