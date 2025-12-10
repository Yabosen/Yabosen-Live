import { NextResponse } from 'next/server'

// In-memory cache for Discord presence
// In production, consider using a database for persistence
let presenceCache: {
  isOnline: boolean
  status: 'online' | 'offline' | 'idle' | 'dnd'
  lastUpdated: number
} | null = null

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export async function GET() {
  try {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
    const USER_ID = process.env.DISCORD_USER_ID
<<<<<<< HEAD

=======
    
>>>>>>> parent of 9e59bb0 (f[jaseuifhe;FIUEDGHBVDEGehgoiuerjS:HBGdefrgiulerlz.cfkbgivefrdlgv)
    if (!BOT_TOKEN || !USER_ID) {
      return NextResponse.json(
        { error: 'Discord bot token or user ID not configured' },
        { status: 500 }
      )
    }

    // Check if we have a valid cached presence
    if (presenceCache && Date.now() - presenceCache.lastUpdated < CACHE_DURATION) {
      return NextResponse.json({
        isOnline: presenceCache.isOnline,
        status: presenceCache.status,
      })
    }

    // Get user information from Discord API to verify user exists
    const userResponse = await fetch(`https://discord.com/api/v10/users/${USER_ID}`, {
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return NextResponse.json({
          isOnline: false,
          status: 'offline',
          error: 'User not found',
        })
      }
      throw new Error(`Discord API error: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    // Discord REST API doesn't provide presence directly
    // Presence requires Gateway API (WebSocket connection)
    // For this implementation, we'll check mutual guilds and try to infer status
    // Full real-time presence requires a Gateway connection (see DISCORD_SETUP.md)
<<<<<<< HEAD

=======
    
>>>>>>> parent of 9e59bb0 (f[jaseuifhe;FIUEDGHBVDEGehgoiuerjS:HBGdefrgiulerlz.cfkbgivefrdlgv)
    let presenceStatus: 'online' | 'offline' | 'idle' | 'dnd' = 'offline'
    let isOnline = false

    // Try to get the user's status from mutual guilds
    // This requires the bot to be in at least one server with the user
    try {
      // Get bot's guilds
      const botGuildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      })

      if (botGuildsResponse.ok) {
        const botGuilds = await botGuildsResponse.json()
<<<<<<< HEAD

=======
        
>>>>>>> parent of 9e59bb0 (f[jaseuifhe;FIUEDGHBVDEGehgoiuerjS:HBGdefrgiulerlz.cfkbgivefrdlgv)
        // Check if user is a member in any of the bot's guilds
        for (const guild of botGuilds) {
          try {
            const memberResponse = await fetch(
              `https://discord.com/api/v10/guilds/${guild.id}/members/${USER_ID}`,
              {
                headers: {
                  'Authorization': `Bot ${BOT_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              }
            )

            if (memberResponse.ok) {
              // User is in this guild
              // Note: Presence is not available in REST API member object
              // For real-time presence, you need Gateway API
              // This is a placeholder - actual presence requires Gateway connection
              // See DISCORD_SETUP.md for Gateway implementation details
            }
          } catch (err) {
            // Continue checking other guilds
            continue
          }
        }
      }
    } catch (err) {
      // If we can't check guilds, default to offline
      console.log('Could not check guild presence, defaulting to offline')
    }

    // Update cache
    presenceCache = {
      isOnline,
      status: presenceStatus,
      lastUpdated: Date.now(),
    }
<<<<<<< HEAD

=======
    
>>>>>>> parent of 9e59bb0 (f[jaseuifhe;FIUEDGHBVDEGehgoiuerjS:HBGdefrgiulerlz.cfkbgivefrdlgv)
    return NextResponse.json({
      isOnline: isOnline,
      status: presenceStatus,
      username: userData.username,
      // Note: Real-time presence requires Gateway API implementation
      // See DISCORD_SETUP.md for instructions on setting up Gateway connection
    })
  } catch (error) {
    console.error('Error checking Discord status:', error)
    return NextResponse.json(
<<<<<<< HEAD
      {
=======
      { 
>>>>>>> parent of 9e59bb0 (f[jaseuifhe;FIUEDGHBVDEGehgoiuerjS:HBGdefrgiulerlz.cfkbgivefrdlgv)
        error: 'Failed to check Discord status',
        isOnline: false,
        status: 'offline',
      },
      { status: 500 }
    )
  }
}

