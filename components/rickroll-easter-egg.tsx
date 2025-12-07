"use client"

import { useEffect, useRef, useState } from "react"

// Helper to play YouTube video in hidden iframe
function playYouTubeVideo(videoId: string, duration: number): HTMLIFrameElement {
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.top = "0"
  iframe.style.left = "0"
  iframe.style.width = "1px"
  iframe.style.height = "1px"
  iframe.style.opacity = "0"
  iframe.style.pointerEvents = "none"
  iframe.style.zIndex = "-1"
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}`
  iframe.allow = "autoplay; encrypted-media"
  iframe.allowFullscreen = false
  document.body.appendChild(iframe)

  // Clean up iframe after song ends
  setTimeout(() => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe)
    }
  }, duration)

  return iframe
}

export function RickRollEasterEgg() {
  const [spaceCount, setSpaceCount] = useState(0)
  const [wasdSequence, setWasdSequence] = useState("")
  const lastPressTime = useRef<number>(0)
  const lastWasdTime = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasPlayed = useRef(false)
  const wasdPlayed = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const now = Date.now()

      // --- WASD Easter Egg ---
      if (['w', 'a', 's', 'd'].includes(key)) {
        const timeSinceLastWasd = now - lastWasdTime.current

        // Reset if more than 2 seconds have passed
        if (timeSinceLastWasd > 2000) {
          setWasdSequence(key)
        } else {
          setWasdSequence(prev => {
            const newSeq = prev + key

            // Check if sequence is "wasd"
            if (newSeq === "wasd" && !wasdPlayed.current) {
              wasdPlayed.current = true
              playYouTubeVideo("e9-6kJ8repQ", 180000) // 3 minutes
              setTimeout(() => {
                wasdPlayed.current = false
              }, 180000)
              return ""
            }

            // Keep only last 4 characters
            return newSeq.slice(-4)
          })
        }
        lastWasdTime.current = now
        return
      }

      // --- Space Bar Easter Egg ---
      if (e.code !== "Space" && e.key !== " ") {
        // Reset space count if any other key is pressed (except wasd)
        setSpaceCount(0)
        lastPressTime.current = 0
        return
      }

      // Prevent default space bar behavior (scrolling) only if we're tracking
      if (spaceCount > 0 || lastPressTime.current > 0) {
        e.preventDefault()
      }

      const timeSinceLastPress = now - lastPressTime.current

      // Reset if more than 2 seconds have passed since last press
      if (timeSinceLastPress > 2000) {
        setSpaceCount(1)
        lastPressTime.current = now
        return
      }

      // Increment count
      const newCount = spaceCount + 1
      setSpaceCount(newCount)
      lastPressTime.current = now

      // If we've reached 5 presses, play the song
      if (newCount >= 5 && !hasPlayed.current) {
        hasPlayed.current = true
        playYouTubeVideo("VfQRSjAh_EA", 215000) // 3.5 minutes

        setTimeout(() => {
          hasPlayed.current = false
          setSpaceCount(0)
        }, 215000)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [spaceCount, wasdSequence])

  return null // This component doesn't render anything
}
