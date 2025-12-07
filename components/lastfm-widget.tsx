"use client"

import { Music2 } from "lucide-react"
import { useLastFmStatus } from "@/lib/hooks/use-lastfm-status"

export function LastFmWidget() {
    const { track, loading } = useLastFmStatus()

    if (loading) {
        return (
            <div className="flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-24" />
                    <div className="h-2 bg-muted rounded w-16" />
                </div>
            </div>
        )
    }

    if (!track.isPlaying || !track.track) {
        return (
            <div className="flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
                <Music2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Not playing anything</span>
            </div>
        )
    }

    return (
        <a
            href={track.track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
            {track.track.albumArt ? (
                <img
                    src={track.track.albumArt}
                    alt={track.track.album || track.track.name}
                    className="h-10 w-10 rounded object-cover"
                />
            ) : (
                <div className="h-10 w-10 bg-primary/20 rounded flex items-center justify-center">
                    <Music2 className="h-5 w-5 text-primary" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {track.track.name}
                    </p>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                    {track.track.artist}
                </p>
            </div>
        </a>
    )
}
