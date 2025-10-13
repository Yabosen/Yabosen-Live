"use client"

import { Card } from "@/components/ui/card"
import { siteConfig } from "@/lib/config"
import { Crosshair, ExternalLink } from "lucide-react"

export function CSStats() {
  if (!siteConfig.csStats.enabled) return null

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Crosshair className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Counter-Strike Stats</h3>
      </div>

      <div className="flex flex-col gap-3">
        {siteConfig.csStats.links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 rounded-lg p-4 border border-border/30 transition-all hover:border-primary/50 group"
          >
            <span className="font-medium text-foreground group-hover:text-primary transition-colors">{link.name}</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ))}
      </div>
    </Card>
  )
}
