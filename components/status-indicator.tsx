"use client"

import { useCustomStatus } from "@/lib/hooks/use-custom-status"
import { DiscordStatusIndicator } from "./discord-status-indicator"

export function StatusIndicator() {
    const { status, customMessage, activityType, activityName, episodeInfo, seasonInfo, loading, isOnline } = useCustomStatus()

    return (
        <DiscordStatusIndicator
            status={status}
            customMessage={customMessage}
            activityType={activityType}
            activityName={activityName}
            episodeInfo={episodeInfo}
            seasonInfo={seasonInfo}
            loading={loading}
            isOnline={isOnline}
        />
    )
}
