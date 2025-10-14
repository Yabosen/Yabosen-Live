import { NextResponse } from 'next/server'

// Ensure this route is not statically cached by Next.js
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Twitch API credentials - you'll need to set these as environment variables
    const CLIENT_ID = process.env.TWITCH_CLIENT_ID
    const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET
    const TWITCH_USERNAME = process.env.TWITCH_USERNAME || 'yab0sen'
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Twitch API credentials not configured' },
        { status: 500 }
      )
    }

    // Get app access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
      // Never cache OAuth token responses
      cache: 'no-store',
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Twitch access token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Check if the configured user is live
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(TWITCH_USERNAME)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': CLIENT_ID,
        },
        // Always fetch fresh stream status
        cache: 'no-store',
      }
    )

    if (!streamResponse.ok) {
      throw new Error('Failed to fetch stream data')
    }

    const streamData = await streamResponse.json()
    const isLive = streamData.data && streamData.data.length > 0

    if (isLive) {
      const stream = streamData.data[0]
      return NextResponse.json({
        isLive: true,
        title: stream.title,
        gameName: stream.game_name,
        viewerCount: stream.viewer_count,
        startedAt: stream.started_at,
        thumbnailUrl: stream.thumbnail_url,
      }, { headers: { 'Cache-Control': 'no-store' } })
    } else {
      return NextResponse.json({
        isLive: false,
      }, { headers: { 'Cache-Control': 'no-store' } })
    }
  } catch (error) {
    console.error('Error checking Twitch status:', error)
    return NextResponse.json(
      { error: 'Failed to check stream status' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
