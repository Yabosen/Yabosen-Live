"use client"

import { useEffect, useState } from 'react'

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

export function useDiscordPresence() {
    const [presence, setPresence] = useState<DiscordPresence>({
        isOnline: false,
        status: 'offline'
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPresence = async () => {
            try {
                setLoading(true)
                setError(null)

                // Use Lanyard API for real-time Discord presence
                const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch Discord presence')
                }

                const data = await response.json()

                if (data.success && data.data) {
                    const lanyardData = data.data

                    setPresence({
                        isOnline: lanyardData.discord_status !== 'offline',
                        status: lanyardData.discord_status || 'offline',
                        username: lanyardData.discord_user?.username,
                        discriminator: lanyardData.discord_user?.discriminator,
                        avatar: lanyardData.discord_user?.avatar
                            ? `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${lanyardData.discord_user.avatar}.png`
                            : undefined,
                        activities: lanyardData.activities,
                        spotify: lanyardData.spotify ? {
                            song: lanyardData.spotify.song,
                            artist: lanyardData.spotify.artist,
                            album: lanyardData.spotify.album,
                            album_art_url: lanyardData.spotify.album_art_url,
                            timestamps: lanyardData.spotify.timestamps
                        } : undefined
                    })
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
                console.error('Error fetching Discord presence:', err)
                setPresence({ isOnline: false, status: 'offline' })
            } finally {
                setLoading(false)
            }
        }

        // Fetch immediately
        fetchPresence()

        // Poll every 30 seconds for updates
        const interval = setInterval(fetchPresence, 30000)

        return () => clearInterval(interval)
    }, [])

    return { presence, loading, error }
}
