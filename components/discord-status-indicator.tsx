"use client"

import { Circle } from "lucide-react"
import { useCustomStatus } from "@/lib/hooks/use-custom-status"

const statusColors: Record<string, string> = {
    online: "text-green-500",
    idle: "text-yellow-500",
    dnd: "text-red-500",
    offline: "text-gray-500",
    sleeping: "text-purple-500",
    streaming: "text-pink-500",
}

const statusLabels: Record<string, string> = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline",
    sleeping: "Sleeping",
    streaming: "Streaming",
}

export function DiscordStatusIndicator() {
    const { status, customMessage, loading, isOnline } = useCustomStatus()

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Circle className="h-3 w-3 text-gray-500 animate-pulse" fill="currentColor" />
                <span>Loading...</span>
            </div>
        )
    }

    // Handle generic status strings
    const colorClass = statusColors[status] || "text-gray-500"
    const displayLabel = statusLabels[status] || (status.charAt(0).toUpperCase() + status.slice(1))

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="relative">
                <Circle
                    className={`h-3 w-3 ${colorClass} ${isOnline ? 'animate-pulse' : ''}`}
                    fill="currentColor"
                />
                {isOnline && statusColors[status] && (
                    <span className={`absolute inset-0 h-3 w-3 rounded-full ${colorClass.replace('text-', 'bg-')}/30 animate-ping`} />
                )}
            </div>
            <span className="text-muted-foreground">
                {displayLabel}
            </span>
            {customMessage && (
                <span className="text-xs text-muted-foreground/70 hidden sm:inline">
                    • {customMessage}
                </span>
            )}
        </div>
    )
}
