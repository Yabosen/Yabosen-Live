"use client"

import { Card } from "@/components/ui/card"
import { siteConfig } from "@/lib/config"
import { useCustomStatus } from "@/lib/hooks/use-custom-status"
import { DiscordStatusIndicator } from "./discord-status-indicator"

export function StreamStatus() {
  const { streamStatus } = siteConfig
  const { status, customMessage, isOnline, loading } = useCustomStatus()

  // Only show if online
  if (!isOnline) {
    return null
  }

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }

  return (
    <a
      href={streamStatus.streamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${positionClasses[streamStatus.position]} z-50 animate-in fade-in slide-in-from-top-2 duration-500`}
    >
      <Card className="bg-card/95 backdrop-blur-sm border-primary/50 hover:border-primary transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg shadow-primary/20">
        <div className="p-4">
          <DiscordStatusIndicator
            status={status}
            customMessage={customMessage}
            loading={loading}
            isOnline={isOnline}
          />
        </div>
      </Card>
    </a>
  )
}
