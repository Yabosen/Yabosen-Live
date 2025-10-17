"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, X } from "lucide-react"
import { siteConfig } from "@/lib/config"
import { useTwitchStatus } from "@/lib/hooks/use-twitch-status"

export function StreamStatus() {
  const { streamStatus } = siteConfig
  const { status: twitchStatus } = useTwitchStatus()
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  const isLive = twitchStatus.isLive || streamStatus.isLive
  const title = twitchStatus.title || streamStatus.title
  const gameName = twitchStatus.gameName
  const viewerCount = twitchStatus.viewerCount

  if (!isLive) return null

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }

  return (
    <div
      className={`fixed ${positionClasses[streamStatus.position]} z-50 animate-in fade-in slide-in-from-top-2 duration-500`}
    >
      <Card className="relative bg-card/95 backdrop-blur-sm border-primary/50 hover:border-primary transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg shadow-primary/20">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <a
          href={streamStatus.streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4"
        >
          <div className="flex items-center gap-3">
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
        </a>
      </Card>
    </div>
  )
}
