"use client"

import { useEffect, useRef, useState } from "react"

export function RickRollEasterEgg() {
  const [spaceCount, setSpaceCount] = useState(0)
  const lastPressTime = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasPlayed = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only listen to space bar
      if (e.code !== "Space" && e.key !== " ") {
        // Reset count if any other key is pressed
        setSpaceCount(0)
        lastPressTime.current = 0
        return
      }

      // Prevent default space bar behavior (scrolling) only if we're tracking
      if (spaceCount > 0 || lastPressTime.current > 0) {
        e.preventDefault()
      }

      const now = Date.now()
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

        // Create and play audio using YouTube's audio stream
        // Using a reliable audio source - you may want to host your own audio file
        const audio = new Audio()

        // Using a direct link to the audio (you can replace this with your own hosted file)
        // For now, we'll use a YouTube embed approach since direct audio links are restricted
        const iframe = document.createElement("iframe")
        iframe.style.position = "fixed"
        iframe.style.top = "0"
        iframe.style.left = "0"
        iframe.style.width = "1px"
        iframe.style.height = "1px"
        iframe.style.opacity = "0"
        iframe.style.pointerEvents = "none"
        iframe.style.zIndex = "-1"
        iframe.src = "https://www.youtube.com/embed/VfQRSjAh_EA?autoplay=1&mute=0&loop=1&playlist=VfQRSjAh_EA"
        iframe.allow = "autoplay; encrypted-media"
        iframe.allowFullscreen = false
        document.body.appendChild(iframe)

        // Store reference for cleanup
        audioRef.current = audio

        // Clean up iframe after song ends (approximately 3.5 minutes)
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe)
          }
          hasPlayed.current = false // Allow it to be triggered again
          setSpaceCount(0)
        }, 215000) // 3 minutes 35 seconds
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
  }, [spaceCount])

  return null // This component doesn't render anything
}

