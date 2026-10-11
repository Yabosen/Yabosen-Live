import { NextResponse } from 'next/server'

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_USERNAME = process.env.LASTFM_USERNAME || "LutyLutanu606"

// Visitors poll every 15 s. A 10 s CDN cache keeps Last.fm calls bounded while
// a track change still shows up within ~25 s at worst.
const CACHE_CONTROL = 'public, s-maxage=10, stale-while-revalidate=5'

export async function GET() {
    try {
        if (!LASTFM_API_KEY) {
            return NextResponse.json(
                { isPlaying: false, error: 'Last.fm API key not configured' },
                {
                    status: 200,
                    headers: {
                        'Cache-Control': CACHE_CONTROL,
                    },
                }
            )
        }

        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`,
            { cache: 'no-store' }
        )

        if (!response.ok) {
            throw new Error(`Last.fm API error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.recenttracks?.track?.[0]) {
            return NextResponse.json(
                { isPlaying: false },
                {
                    headers: {
                        'Cache-Control': CACHE_CONTROL,
                    },
                }
            )
        }

        const track = data.recenttracks.track[0]
        const isPlaying = track['@attr']?.nowplaying === 'true'

        return NextResponse.json(
            {
                isPlaying,
                track: {
                    name: track.name,
                    artist: track.artist?.['#text'] || track.artist,
                    album: track.album?.['#text'] || undefined,
                    albumArt: track.image?.[2]?.['#text'] || track.image?.[1]?.['#text'] || undefined,
                    url: track.url
                }
            },
            {
                headers: {
                    'Cache-Control': CACHE_CONTROL,
                },
            }
        )
    } catch (error) {
        console.error('Error fetching Last.fm data:', error)
        return NextResponse.json(
            { isPlaying: false, error: 'Failed to fetch Last.fm data' },
            { status: 500 }
        )
    }
}
