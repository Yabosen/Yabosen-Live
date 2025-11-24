"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { siteConfig } from "@/lib/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TopNav() {
  const isLive = siteConfig.multiStreamStatus.platforms.some((p) => p.isLive)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary/20">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left side with invisible button and donate button */}
        <div className="flex items-center">
          {/* Invisible Credits Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-transparent bg-transparent hover:bg-transparent border-0 p-0 h-9 w-16 mr-0 cursor-pointer"
                aria-label="Credits"
              >
                {/* Invisible button - clickable area to the left of donate button */}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Credits</DialogTitle>
                <DialogDescription>
                  by Fanta/Teri and Bendy
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Donate Button */}
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
        </div>

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
