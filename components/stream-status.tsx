"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio } from "lucide-react"
import { siteConfig } from "@/lib/config"
import { useTwitchStatus } from "@/lib/hooks/use-twitch-status"

export function StreamStatus() {
  const { streamStatus } = siteConfig
  const { status: twitchStatus, loading } = useTwitchStatus()

  // Use real Twitch status if available, fallback to config
  const isLive = twitchStatus.isLive || streamStatus.isLive
  const title = twitchStatus.title || streamStatus.title
  const gameName = twitchStatus.gameName
  const viewerCount = twitchStatus.viewerCount

  if (!isLive) {
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
        <div className="p-4 flex items-center gap-3">
          <div className="relative">
            <Radio className="h-5 w-5 text-primary animate-pulse" />
            <span className="absolute inset-0 h-5 w-5 rounded-full bg-primary/30 animate-ping" />
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="destructive" className="w-fit bg-primary hover:bg-primary text-primary-foreground">
              LIVE NOW
            </Badge>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>on {streamStatus.platform}</span>
              {gameName && <span>• {gameName}</span>}
              {viewerCount && <span>• {viewerCount.toLocaleString()} viewers</span>}
            </div>
          </div>
        </div>
      </Card>
    </a>
  )
}
