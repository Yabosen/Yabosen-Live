"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Circle } from "lucide-react"
import { siteConfig } from "@/lib/config"
import { useCustomStatus } from "@/lib/hooks/use-custom-status"

export function MultiStreamStatus() {
  const { status, customMessage, isOnline } = useCustomStatus()

  // Update the platforms with real status data
  const platforms = siteConfig.multiStreamStatus.platforms.map(platform => {
    if (platform.platform === "Discord") {
      return {
        ...platform,
        isLive: isOnline,
        title: status ? `Status: ${status.toUpperCase()}` : platform.title,
        viewers: customMessage || "",
      }
    }
    return platform
  })

  const activeStreams = platforms.filter((p) => p.isLive)

  if (activeStreams.length === 0) {
    return null
  }

  const statusColors: Record<string, string> = {
    online: "text-green-500",
    idle: "text-yellow-500",
    dnd: "text-red-500",
    offline: "text-gray-500",
    sleeping: "text-purple-500",
    streaming: "text-pink-500",
  }

  const statusLabels: Record<string, string> = {
    online: "ONLINE",
    idle: "IDLE",
    dnd: "DO NOT DISTURB",
    offline: "OFFLINE",
    sleeping: "SLEEPING",
    streaming: "STREAMING",
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-card/95 backdrop-blur-sm border-primary/50 shadow-xl shadow-primary/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Circle className={`h-6 w-6 ${statusColors[status] || 'text-gray-500'} animate-pulse`} fill="currentColor" />
              <span className={`absolute inset-0 h-6 w-6 rounded-full ${statusColors[status]?.replace('text-', 'bg-') || 'bg-gray-500'}/30 animate-ping`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Discord Status</h3>
              <p className="text-sm text-muted-foreground">Current online status</p>
            </div>
          </div>

          {/* Discord Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeStreams.map((stream) => (
              <a
                key={stream.platform}
                href={stream.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-lg border border-border/50 bg-background/50 p-4 transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="destructive" className="bg-primary hover:bg-primary text-primary-foreground">
                    {statusLabels[status] || 'OFFLINE'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {stream.platform}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{stream.title}</p>
                  </div>
                </div>
                {customMessage && <p className="text-xs text-muted-foreground mt-2">{customMessage}</p>}
              </a>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
