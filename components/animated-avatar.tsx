"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface AnimatedAvatarProps {
    src: string
    alt: string
    size?: number
}

export function AnimatedAvatar({ src, alt, size = 140 }: AnimatedAvatarProps) {
    const [loaded, setLoaded] = useState(false)

    return (
        <div
            className="animated-avatar-container relative"
            style={{ width: size, height: size }}
        >
            {/* Outer fire glow layers */}
            <div className="absolute inset-[-8px] rounded-sm fire-glow-outer" />
            <div className="absolute inset-[-6px] rounded-sm fire-glow-middle" />
            <div className="absolute inset-[-4px] rounded-sm fire-glow-inner" />

            {/* Fire flames on edges */}
            <div className="absolute inset-[-10px] fire-flames-layer" />

            {/* Border frame */}
            <div className="absolute inset-[-3px] rounded-sm border-2 border-purple-500/80 fire-border" />

            {/* Avatar image */}
            <div className="relative w-full h-full rounded-sm overflow-hidden bg-black">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className={`object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setLoaded(true)}
                    priority
                />
                {!loaded && (
                    <div className="absolute inset-0 bg-purple-900/20 animate-pulse" />
                )}
            </div>
        </div>
    )
}
