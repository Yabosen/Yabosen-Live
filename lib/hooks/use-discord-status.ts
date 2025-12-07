"use client"

import { useState, useEffect } from 'react'

interface DiscordStatus {
  isOnline: boolean
  status?: 'online' | 'offline' | 'idle' | 'dnd'
  username?: string
  error?: string
}

export function useDiscordStatus() {
  const [status, setStatus] = useState<DiscordStatus>({ isOnline: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/discord-status')
        
        if (!response.ok) {
          throw new Error('Failed to fetch Discord status')
        }
        
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching Discord status:', err)
        // Set offline status on error
        setStatus({ isOnline: false, status: 'offline' })
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchStatus()

    // Set up polling every hour (3600000ms)
    const interval = setInterval(fetchStatus, 3600000)

    return () => clearInterval(interval)
  }, [])

  return { status, loading, error }
}

