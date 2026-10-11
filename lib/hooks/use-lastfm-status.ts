"use client"

import { useEffect, useState } from 'react'

interface LastFmTrack {
    isPlaying: boolean
    track?: {
        name: string
        artist: string
        album?: string
        albumArt?: string
        url?: string
    }
}

const POLL_INTERVAL = 15_000

export function useLastFmStatus() {
    const [track, setTrack] = useState<LastFmTrack>({ isPlaying: false })
    // Only true until the first answer arrives, so widgets don't flash a skeleton on every poll.
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        let inFlight = false

        const fetchTrack = async () => {
            if (inFlight) return
            inFlight = true
            try {
                const response = await fetch('/api/lastfm', { cache: 'no-store' })
                if (!response.ok) throw new Error(`Last.fm request failed (${response.status})`)
                const data: LastFmTrack = await response.json()
                if (cancelled) return
                setTrack(data)
                setError(null)
            } catch (err) {
                // Keep showing the last known track; a blip shouldn't read as "stopped".
                if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                inFlight = false
                if (!cancelled) setLoading(false)
            }
        }

        fetchTrack()
        const interval = setInterval(fetchTrack, POLL_INTERVAL)

        // Browsers slow timers down in background tabs; catch up as soon as the page is seen again.
        const onVisible = () => {
            if (document.visibilityState === 'visible') fetchTrack()
        }
        document.addEventListener('visibilitychange', onVisible)
        window.addEventListener('online', fetchTrack)

        return () => {
            cancelled = true
            clearInterval(interval)
            document.removeEventListener('visibilitychange', onVisible)
            window.removeEventListener('online', fetchTrack)
        }
    }, [])

    return { track, loading, error }
}
