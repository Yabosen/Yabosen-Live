"use client"

import { useState, useEffect } from 'react'

interface TwitchStatus {
  isLive: boolean
  title?: string
  gameName?: string
  viewerCount?: number
  startedAt?: string
  thumbnailUrl?: string
}

export function useTwitchStatus() {
  const [status, setStatus] = useState<TwitchStatus>({ isLive: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/twitch-status')
        
        if (!response.ok) {
          throw new Error('Failed to fetch stream status')
        }
        
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching Twitch status:', err)
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchStatus()

    // Set up polling every 30 seconds
    const interval = setInterval(fetchStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return { status, loading, error }
}
