"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import ReactPlayer from 'react-player/youtube'
import { useLastFmStatus } from '@/lib/hooks/use-lastfm-status'
import { Volume2, VolumeX, Music2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackgroundMusicPlayer() {
    const { track } = useLastFmStatus()
    const [playing, setPlaying] = useState(false)
    const [muted, setMuted] = useState(false)
    const [volume, setVolume] = useState(0.5)
    // Initialize with empty, will set when searching
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [userHasInteracted, setUserHasInteracted] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    // Keep track of the last song we searched for to avoid repeated API calls
    const lastSearchedSongRef = useRef<string | null>(null)

    // Handle initial user interaction to unlock audio
    useEffect(() => {
        const handleInteraction = () => {
            setUserHasInteracted(true)
            // Only auto-play if we actually have a valid URL
            if (videoUrl) {
                setPlaying(true)
            }
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('keydown', handleInteraction)
        }

        document.addEventListener('click', handleInteraction)
        document.addEventListener('keydown', handleInteraction)

        return () => {
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('keydown', handleInteraction)
        }
    }, [videoUrl]) // Depend on videoUrl so we start playing if interaction happened

    const searchAndPlayTrack = useCallback(async (songName: string, artistName: string) => {
        const query = `${artistName} - ${songName}`

        // Don't search again if it's the same song
        if (lastSearchedSongRef.current === query) return

        setIsSearching(true)
        lastSearchedSongRef.current = query

        try {
            const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`)
            if (res.ok) {
                const data = await res.json()
                if (data.videoId) {
                    setVideoUrl(`https://www.youtube.com/watch?v=${data.videoId}`)
                    // If user has already interacted, start playing immediately
                    if (userHasInteracted) {
                        setPlaying(true)
                    }
                }
            }
        } catch (err) {
            console.error('Failed to search video:', err)
        } finally {
            setIsSearching(false)
        }
    }, [userHasInteracted])

    useEffect(() => {
        // CASE 1: Not playing on Last.fm
        if (!track?.isPlaying || !track.track) {
            setPlaying(false)
            setVideoUrl(null)
            lastSearchedSongRef.current = null
            return
        }

        // CASE 2: Playing on Last.fm -> Search and play
        if (track.track.name && track.track.artist) {
            searchAndPlayTrack(track.track.name, track.track.artist)
        }

    }, [track, searchAndPlayTrack])

    const toggleMute = () => setMuted(!muted)

    // Don't render anything if we're not supposed to play anything (inactive)
    // But keep it logical: if Last.fm is playing, we show the controls.
    // If Last.fm is NOT playing, we hide controls or show 'Idle'?
    // User wants "if nothing plays from last.fm make it play ... on repeat" -> wait, user said REMOVE that.
    // So if nothing plays, silence.

    if (!track?.isPlaying || !videoUrl) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">

            {/* Hidden Player */}
            <div className="hidden">
                <ReactPlayer
                    url={videoUrl}
                    playing={playing}
                    loop={false}
                    controls={false}
                    volume={volume}
                    muted={muted}
                    width="0"
                    height="0"
                    onEnded={() => {
                        // Song ended. Usually Last.fm updates before this happens repeatedly.
                    }}
                    onError={(e) => console.error("Player error", e)}
                />
            </div>

            {/* Mini Controller */}
            <div className={cn(
                "flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-full py-2 px-4 shadow-lg transition-all duration-300",
                !userHasInteracted && "animate-pulse ring-2 ring-primary"
            )}>
                {/* Visualizer / Status */}
                <div className="flex flex-col max-w-[150px]">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        NOW PLAYING
                    </span>
                    <span className="text-xs truncate text-muted-foreground">
                        {isSearching ? 'Searching...' :
                            (track?.track ? track.track.name : 'Unknown')}
                    </span>
                </div>

                <div className="h-6 w-[1px] bg-border mx-1" />

                <button
                    onClick={toggleMute}
                    className="hover:text-primary transition-colors focus:outline-none"
                    aria-label={muted ? "Unmute" : "Mute"}
                >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => {
                        setVolume(parseFloat(e.target.value))
                        if (parseFloat(e.target.value) > 0) setMuted(false)
                    }}
                    className="w-16 h-1 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
            </div>

            {!userHasInteracted && (
                <div className="bg-popover text-popover-foreground text-xs py-1 px-3 rounded-full shadow-md animate-bounce">
                    Click anywhere to enable audio
                </div>
            )}
        </div>
    )
}
