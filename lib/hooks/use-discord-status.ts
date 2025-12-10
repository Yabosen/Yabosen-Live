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

  /* 
   * DISCORD INTEGRATION DISABLED
   * The fetch logic has been removed to disable the integration
   * as requested, while preserving the hook interface for the UI.
   */
  useEffect(() => {
    setLoading(false)
    // Default to offline
    setStatus({ isOnline: false, status: 'offline' })
  }, [])

  return { status, loading, error }
}

