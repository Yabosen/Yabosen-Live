// Custom status hook with 5-second polling
// Add to: lib/hooks/use-custom-status.ts

"use client"

import { useEffect, useState, useCallback, useRef } from 'react'

export type StatusType = 'online' | 'offline' | 'dnd' | 'idle' | 'sleeping' | 'streaming'

interface StatusData {
    status: StatusType
    customMessage: string | null
    activityType: 'playing' | 'watching' | null
    activityName: string | null
    episodeInfo: string | null
    seasonInfo: string | null
    updatedAt: number
}

const POLL_INTERVAL = 5000 // 5 seconds

export function useCustomStatus() {
    const [statusData, setStatusData] = useState<StatusData>({
        status: 'offline',
        customMessage: null,
        activityType: null,
        activityName: null,
        episodeInfo: null,
        seasonInfo: null,
        updatedAt: Date.now(),
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/status?t=${Date.now()}`, {
                cache: 'no-cache',
            })

            if (!response.ok) {
                throw new Error('Failed to fetch status')
            }

            const data = await response.json()
            setStatusData(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Initial fetch
        fetchStatus()

        // Set up polling
        intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [fetchStatus])

    return {
        status: statusData.status,
        customMessage: statusData.customMessage,
        activityType: statusData.activityType,
        activityName: statusData.activityName,
        episodeInfo: statusData.episodeInfo,
        seasonInfo: statusData.seasonInfo,
        updatedAt: statusData.updatedAt,
        loading,
        error,
        isOnline: statusData.status !== 'offline',
    }
}
