"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio } from "lucide-react"
import { siteConfig } from "@/lib/config"

export function MultiStreamStatus() {
  const activeStreams = siteConfig.multiStreamStatus.platforms.filter((p) => p.isLive)

  if (activeStreams.length === 0) {
    return null
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-card/95 backdrop-blur-sm border-primary/50 shadow-xl shadow-primary/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Radio className="h-6 w-6 text-primary animate-pulse" />
              <span className="absolute inset-0 h-6 w-6 rounded-full bg-primary/30 animate-ping" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Currently Streaming</h3>
              <p className="text-sm text-muted-foreground">Click to watch on your preferred platform</p>
            </div>
          </div>

          {/* Stream Platforms */}
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
                    LIVE
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {stream.platform}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{stream.title}</p>
                  </div>
                </div>
                {stream.viewers && <p className="text-xs text-muted-foreground mt-2">{stream.viewers} watching</p>}
              </a>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
