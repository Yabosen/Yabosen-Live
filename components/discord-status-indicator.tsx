"use client"

import { Circle } from "lucide-react"
import { useDiscordPresence } from "@/lib/hooks/use-discord-presence"

const statusColors: Record<string, string> = {
    online: "text-green-500",
    idle: "text-yellow-500",
    dnd: "text-red-500",
    offline: "text-gray-500",
}

const statusLabels: Record<string, string> = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline",
}

export function DiscordStatusIndicator() {
    const { presence, loading } = useDiscordPresence()

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Circle className="h-3 w-3 text-gray-500 animate-pulse" fill="currentColor" />
                <span>Loading...</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="relative">
                <Circle
                    className={`h-3 w-3 ${statusColors[presence.status]} ${presence.isOnline ? 'animate-pulse' : ''}`}
                    fill="currentColor"
                />
                {presence.isOnline && (
                    <span className={`absolute inset-0 h-3 w-3 rounded-full ${statusColors[presence.status].replace('text-', 'bg-')}/30 animate-ping`} />
                )}
            </div>
            <span className="text-muted-foreground">
                {statusLabels[presence.status]}
            </span>
            {presence.activities && presence.activities.length > 0 && presence.activities[0].name && (
                <span className="text-xs text-muted-foreground/70 hidden sm:inline">
                    • {presence.activities[0].name}
                </span>
            )}
        </div>
    )
}
