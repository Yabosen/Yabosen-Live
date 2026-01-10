"use client"

import { Circle, Moon, Video } from "lucide-react"
import { StatusType } from "@/lib/hooks/use-custom-status"

interface DiscordStatusIndicatorProps {
    status: StatusType
    customMessage: string | null
    activityType: 'playing' | 'watching' | null
    activityName: string | null
    episodeInfo: string | null
    seasonInfo: string | null
    loading: boolean
    isOnline: boolean
}

const statusColors: Record<StatusType, { color: string; label: string; icon?: 'moon' | 'video' }> = {
    online: { color: "text-green-500", label: "Online" },
    idle: { color: "text-yellow-500", label: "Idle" },
    dnd: { color: "text-red-500", label: "Do Not Disturb" },
    offline: { color: "text-gray-500", label: "Offline" },
    sleeping: { color: "text-purple-500", label: "Sleeping", icon: 'moon' },
    streaming: { color: "text-pink-500", label: "Streaming", icon: 'video' },
}

export function DiscordStatusIndicator({
    status,
    customMessage,
    activityType,
    activityName,
    episodeInfo,
    seasonInfo,
    loading,
    isOnline
}: DiscordStatusIndicatorProps) {
    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Circle className="h-3 w-3 text-gray-500 animate-pulse" fill="currentColor" />
                <span>Loading...</span>
            </div>
        )
    }

    const config = statusColors[status] || statusColors.offline
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

    // Format activity text
    const getActivityText = () => {
        if (!activityType || !activityName) return null

        if (activityType === 'playing') {
            // If status is 'streaming', show "Streaming: GameName" instead of "Playing: GameName"
            if (status === 'streaming') {
                return `Streaming: ${activityName}`
            }
            return `Playing: ${activityName}`
        }

        if (activityType === 'watching') {
            let text = `Watching: ${activityName}`
            const extras: string[] = []

            if (seasonInfo) extras.push(seasonInfo)
            if (episodeInfo) extras.push(`Ep ${episodeInfo}`)

            if (extras.length > 0) {
                text += ` (${extras.join(' ')})`
            }

            return text
        }

        return null
    }

    const activityText = getActivityText()
    const displayText = activityText || customMessage || config.label

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

            {/* Main Status Text */}
            <span className="text-muted-foreground font-medium">
                {displayText}
            </span>

            {/* Secondary Text (if we showed activity, show custom message or label as secondary if needed, but keeping it simple for now) */}
            {/* If we are showing activity text, we might want to also show the base status label in tooltip or small text, but user didn't request that. 
                However, if we are Showing Custom Message, we usually replace the label.
                Here, let's prioritize Activity > CustomMessage > Status Label.
            */}

            {/* If we have an activity AND a custom message, maybe show custom message as secondary? */}
            {(activityText && customMessage) && (
                <span className="text-xs text-muted-foreground/70 hidden sm:inline border-l border-border/50 pl-2">
                    {customMessage}
                </span>
            )}

            {/* If we have NO activity but a custom message, we showed it in displayText. 
                 If we used the default label, we showed it in displayText. 
             */}
        </div>
    )
}
