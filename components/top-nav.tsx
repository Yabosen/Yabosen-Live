"use client"

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { siteConfig } from "@/lib/config"
import { useTwitchStatus } from "@/lib/hooks/use-twitch-status"

export function TopNav() {
 
  const { streamStatus } = siteConfig
  const { status: twitchStatus, loading } = useTwitchStatus()

  // Use real Twitch status if available, fallback to config
  const isLive = twitchStatus.isLive || streamStatus.isLive
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary/20">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Donate Button - Left */}
        <Button
          asChild
          variant="ghost"
          className="text-background hover:bg-primary-foreground/10 hover:text-background font-medium"
        >
          <a href={siteConfig.donateUrl} target="_blank" rel="noopener noreferrer">
            <Heart className="mr-2 h-4 w-4 fill-black text-black" />
            Donate
          </a>
        </Button>

        {/* Live Status - Right */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isLive
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-background/20 text-background/60 border border-background/20"
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-background/40"}`} />
            <span className="text-sm font-medium">{isLive ? "LIVE" : "OFFLINE"}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
