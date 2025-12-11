"use client"

import { useCustomStatus } from "@/lib/hooks/use-custom-status"
import { DiscordStatusIndicator } from "./discord-status-indicator"

export function StatusIndicator() {
    const { status, customMessage, loading, isOnline } = useCustomStatus()

    return (
        <DiscordStatusIndicator
            status={status}
            customMessage={customMessage}
            loading={loading}
            isOnline={isOnline}
        />
    )
}
