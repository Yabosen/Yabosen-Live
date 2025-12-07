import { NextResponse } from 'next/server'

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_USERNAME = process.env.LASTFM_USERNAME || "LutyLutanu606"

export async function GET() {
    try {
        if (!LASTFM_API_KEY) {
            return NextResponse.json(
                { isPlaying: false, error: 'Last.fm API key not configured' },
                {
                    status: 200,
                    headers: {
                        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                    },
                }
            )
        }

        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`,
            { next: { revalidate: 30 } }
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
                        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
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
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
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
