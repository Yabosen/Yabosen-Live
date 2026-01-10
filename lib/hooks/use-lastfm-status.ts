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

export function useLastFmStatus() {
    const [track, setTrack] = useState<LastFmTrack>({ isPlaying: false })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('/api/lastfm')

                if (!response.ok) {
                    // If API key isn't set yet, just set not playing
                    setTrack({ isPlaying: false })
                    return
                }

                const data = await response.json()
                setTrack(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
                console.error('Error fetching Last.fm status:', err)
                setTrack({ isPlaying: false })
            } finally {
                setLoading(false)
            }
        }

        // Fetch immediately
        fetchTrack()

        // Poll every 30 seconds
        const interval = setInterval(fetchTrack, 30000)

        return () => clearInterval(interval)
    }, [])

    return { track, loading, error }
}
