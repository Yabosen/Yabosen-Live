// Updated status indicator component
// Replace: components/discord-status-indicator.tsx

"use client"

import { Circle, Moon, Video } from "lucide-react"
import { useCustomStatus, StatusType } from "@/lib/hooks/use-custom-status"

const statusConfig: Record<StatusType, { color: string; label: string; icon?: 'moon' | 'video' }> = {
    online: { color: "text-green-500", label: "Online" },
    idle: { color: "text-yellow-500", label: "Idle" },
    dnd: { color: "text-red-500", label: "Do Not Disturb" },
    offline: { color: "text-gray-500", label: "Offline" },
    sleeping: { color: "text-purple-500", label: "Sleeping", icon: 'moon' },
    streaming: { color: "text-red-500", label: "Streaming", icon: 'video' },
}

export function StatusIndicator() {
    const { status, customMessage, loading, isOnline } = useCustomStatus()

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Circle className="h-3 w-3 text-gray-500 animate-pulse" fill="currentColor" />
                <span>Loading...</span>
            </div>
        )
    }

    const config = statusConfig[status]
    const showPulse = isOnline && status !== 'sleeping'

    // Choose icon based on status
    const renderIcon = () => {
        if (config.icon === 'moon') {
            return <Moon className={`h-3 w-3 ${config.color}`} fill="currentColor" />
        }
        if (config.icon === 'video') {
            return <Video className={`h-3 w-3 ${config.color} animate-pulse`} />
        }
        return (
            <Circle
                className={`h-3 w-3 ${config.color} ${showPulse ? 'animate-pulse' : ''}`}
                fill="currentColor"
            />
        )
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="relative">
                {renderIcon()}
                {showPulse && (
                    <span
                        className={`absolute inset-0 h-3 w-3 rounded-full ${config.color.replace('text-', 'bg-')}/30 animate-ping`}
                    />
                )}
            </div>
            <span className="text-muted-foreground">
                {config.label}
            </span>
            {customMessage && (
                <span className="text-xs text-muted-foreground/70 hidden sm:inline">
                    • {customMessage}
                </span>
            )}
        </div>
    )
}

// Keep old export name for compatibility
export { StatusIndicator as DiscordStatusIndicator }
