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

    const connect = useCallback(() => {
        // Clean up existing connection
        if (wsRef.current) {
            wsRef.current.close()
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current)
        }

        try {
            const ws = new WebSocket(LANYARD_WS_URL)
            wsRef.current = ws

            ws.onopen = () => {
                reconnectAttemptsRef.current = 0
            }

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)

                switch (data.op) {
                    case Opcodes.Hello:
                        // Send initialize message to subscribe to user
                        ws.send(JSON.stringify({
                            op: Opcodes.Initialize,
                            d: {
                                subscribe_to_id: DISCORD_USER_ID
                            }
                        }))

                        // Start heartbeat
                        const heartbeatInterval = data.d.heartbeat_interval
                        heartbeatIntervalRef.current = setInterval(() => {
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ op: Opcodes.Heartbeat }))
                            }
                        }, heartbeatInterval)
                        break

                    case Opcodes.Event:
                        if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                            parsePresenceData(data.d)
                        }
                        break
                }
            }

            ws.onerror = () => {
                setError('WebSocket connection error')
            }

            ws.onclose = () => {
                // Clear heartbeat
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current)
                    heartbeatIntervalRef.current = null
                }

                // Exponential backoff reconnect
                const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
                reconnectAttemptsRef.current++

                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, backoffTime)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect')
            setLoading(false)
        }
    }, [parsePresenceData])

    useEffect(() => {
        connect()

        return () => {
            // Cleanup
            if (wsRef.current) {
                wsRef.current.close()
            }
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current)
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [connect])

    return { presence, loading, error }
}
