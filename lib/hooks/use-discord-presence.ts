"use client"

import { useEffect, useState, useRef, useCallback } from 'react'

interface DiscordPresence {
    isOnline: boolean
    status: 'online' | 'offline' | 'idle' | 'dnd'
    username?: string
    discriminator?: string
    avatar?: string
    activities?: Array<{
        name: string
        type: number
        state?: string
        details?: string
    }>
    spotify?: {
        song: string
        artist: string
        album: string
        album_art_url: string
        timestamps?: {
            start: number
            end: number
        }
    }
}

const DISCORD_USER_ID = process.env.NEXT_PUBLIC_DISCORD_USER_ID || "1408846729645920269"
const LANYARD_WS_URL = "wss://api.lanyard.rest/socket"

// Lanyard WebSocket opcodes
const Opcodes = {
    Event: 0,
    Hello: 1,
    Initialize: 2,
    Heartbeat: 3,
}

export function useDiscordPresence() {
    const [presence, setPresence] = useState<DiscordPresence>({
        isOnline: false,
        status: 'offline'
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttemptsRef = useRef(0)

    const parsePresenceData = useCallback((lanyardData: Record<string, unknown>) => {
        const discordUser = lanyardData.discord_user as Record<string, unknown> | undefined
        const spotify = lanyardData.spotify as Record<string, unknown> | undefined
        const activities = lanyardData.activities as Array<Record<string, unknown>> | undefined

        setPresence({
            isOnline: lanyardData.discord_status !== 'offline',
            status: (lanyardData.discord_status as DiscordPresence['status']) || 'offline',
            username: discordUser?.username as string | undefined,
            discriminator: discordUser?.discriminator as string | undefined,
            avatar: discordUser?.avatar
                ? `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${discordUser.avatar}.png`
                : undefined,
            activities: activities?.map(a => ({
                name: a.name as string,
                type: a.type as number,
                state: a.state as string | undefined,
                details: a.details as string | undefined,
            })),
            spotify: spotify ? {
                song: spotify.song as string,
                artist: spotify.artist as string,
                album: spotify.album as string,
                album_art_url: spotify.album_art_url as string,
                timestamps: spotify.timestamps as { start: number; end: number } | undefined
            } : undefined
        })
        setLoading(false)
        setError(null)
    }, [])

    /*
     * DISCORD INTEGRATION DISABLED
     * WebSocket connection removed to disable Lanyard integration.
     */
    useEffect(() => {
        setLoading(false)
        setPresence({
            isOnline: false,
            status: 'offline'
        })
    }, [])

    // No-op connect function to satisfy potential callers (though internal)
    // The original hook didn't export connect, so we just remove the logic.

    return { presence, loading, error }
}
