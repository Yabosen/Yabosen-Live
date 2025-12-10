import { NextResponse } from 'next/server'
import yts from 'yt-search'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
        return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    }

    try {
        const r = await yts(query)
        const videos = r.videos

        if (videos.length > 0) {
            return NextResponse.json({ videoId: videos[0].videoId })
        }

        return NextResponse.json({ error: 'No video found' }, { status: 404 })
    } catch (error) {
        console.error('YouTube search error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
