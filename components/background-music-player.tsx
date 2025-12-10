"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import ReactPlayer from 'react-player/youtube'
import { useLastFmStatus } from '@/lib/hooks/use-lastfm-status'
import { Volume2, VolumeX, SkipForward, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

const FALLBACK_VIDEO_ID = 'cKkDMiGUbUw'

export function BackgroundMusicPlayer() {
    const { track, loading: lastFmLoading } = useLastFmStatus()
    const [playing, setPlaying] = useState(false)
    const [muted, setMuted] = useState(false)
    const [volume, setVolume] = useState(0.5)
    const [currentVideoId, setCurrentVideoId] = useState(FALLBACK_VIDEO_ID)
    const [videoUrl, setVideoUrl] = useState(`https://www.youtube.com/watch?v=${FALLBACK_VIDEO_ID}`)
    const [userHasInteracted, setUserHasInteracted] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    // Keep track of the last song we searched for to avoid repeated API calls
    const lastSearchedSongRef = useRef<string | null>(null)

    // Handle initial user interaction to unlock audio
    useEffect(() => {
        const handleInteraction = () => {
            setUserHasInteracted(true)
            setPlaying(true)
            // Remove listeners once interaction happened
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('keydown', handleInteraction)
        }

        document.addEventListener('click', handleInteraction)
        document.addEventListener('keydown', handleInteraction)

        return () => {
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('keydown', handleInteraction)
        }
    }, [])

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
                    setCurrentVideoId(data.videoId)
                    setVideoUrl(`https://www.youtube.com/watch?v=${data.videoId}`)
                }
            }
        } catch (err) {
            console.error('Failed to search video:', err)
        } finally {
            setIsSearching(false)
        }
    }, [])

    useEffect(() => {
        if (!track?.isPlaying) {
            // Revert to fallback if not playing anything
            if (currentVideoId !== FALLBACK_VIDEO_ID) {
                setCurrentVideoId(FALLBACK_VIDEO_ID)
                setVideoUrl(`https://www.youtube.com/watch?v=${FALLBACK_VIDEO_ID}`)
                lastSearchedSongRef.current = null
            }
            return
        }

        if (track.track?.name && track.track?.artist) {
            searchAndPlayTrack(track.track.name, track.track.artist)
        }

    }, [track, currentVideoId, searchAndPlayTrack])

    const toggleMute = () => setMuted(!muted)

    // Only show controls if user has interacted, or maybe always show small control?
    // User asked for background music. Let's make it subtle.

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">

            {/* Hidden Player */}
            <div className="hidden">
                <ReactPlayer
                    url={videoUrl}
                    playing={playing}
                    loop={currentVideoId === FALLBACK_VIDEO_ID} // Only loop fallback
                    controls={false}
                    volume={volume}
                    muted={muted}
                    width="0"
                    height="0"
                    onEnded={() => {
                        // If it's the fallback, it loops automatically by `loop` prop.
                        // If it's a song, we might want to replay or just stop? 
                        // Usually songs just end. Let's loop the song too if they want, 
                        // but usually Last.fm updates or user changes song. 
                        // For now let's just let it stop or loop if it's fallback.
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
                        {currentVideoId === FALLBACK_VIDEO_ID ? 'VIBE MODE' : 'NOW PLAYING'}
                    </span>
                    <span className="text-xs truncate text-muted-foreground">
                        {isSearching ? 'Searching...' :
                            (track?.isPlaying && track.track ? track.track.name : 'Vibes')}
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
                    Click anywhere to start music
                </div>
            )}
        </div>
    )
}
