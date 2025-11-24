"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Circle } from "lucide-react"
import { siteConfig } from "@/lib/config"
import { useDiscordStatus } from "@/lib/hooks/use-discord-status"

export function StreamStatus() {
  const { streamStatus } = siteConfig
  const { status: discordStatus, loading } = useDiscordStatus()

  // Use real Discord status if available, fallback to config
  const isOnline = discordStatus.isOnline || false
  const status = discordStatus.status || 'offline'

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

  const statusColors = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    offline: "bg-gray-500",
  }

  const statusLabels = {
    online: "ONLINE",
    idle: "IDLE",
    dnd: "DO NOT DISTURB",
    offline: "OFFLINE",
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
            <Circle className={`h-5 w-5 ${statusColors[status]} animate-pulse`} fill="currentColor" />
            <span className={`absolute inset-0 h-5 w-5 rounded-full ${statusColors[status]}/30 animate-ping`} />
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="destructive" className="w-fit bg-primary hover:bg-primary text-primary-foreground">
              {statusLabels[status]}
            </Badge>
            <p className="text-sm font-medium text-foreground">Discord Status</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>on Discord</span>
              {discordStatus.username && <span>• {discordStatus.username}</span>}
            </div>
          </div>
        </div>
      </Card>
    </a>
  )
}
