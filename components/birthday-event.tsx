"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"

function getUTC3Info() {
  const now = new Date()
  
  // Create a formatter for UTC+3 (using Asia/Riyadh as it does not observe DST and is always UTC+3)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  })
  
  const parts = formatter.formatToParts(now)
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10)
  
  const month = getPart('month') - 1 // 0-indexed, 3 is April
  const date = getPart('day')
  const hours = getPart('hour') === 24 ? 0 : getPart('hour')
  const minutes = getPart('minute')
  const seconds = getPart('second')

  const diffHours = 23 - hours
  const diffMinutes = 59 - minutes
  const diffSeconds = 59 - seconds
  
  return {
    month,
    date,
    timeLeft: { hours: diffHours, minutes: diffMinutes, seconds: diffSeconds }
  }
}

export function BirthdayEvent() {
  const [eventState, setEventState] = useState<"none" | "eve" | "birthday">("none")
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    let interval: NodeJS.Timeout

    const checkDate = () => {
      const { month, date, timeLeft } = getUTC3Info()

      if (month === 3 && date === 29) { // April 29th (Eve)
        setEventState("eve")
        setTimeLeft(timeLeft)
      } else if (month === 3 && date === 30) { // April 30th (Birthday)
        setEventState(prev => {
          if (prev !== "birthday") {
            triggerConfetti()
          }
          return "birthday"
        })
      } else {
        setEventState("none")
      }
    }

    checkDate()
    interval = setInterval(checkDate, 1000)

    return () => clearInterval(interval)
  }, [])

  const triggerConfetti = () => {
    const duration = 15 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
  }

  if (!isClient) return null
  if (eventState === "none") return null

  if (eventState === "eve" && timeLeft) {
    return (
      <div className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.3)] overflow-hidden border-t border-purple-500/30">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-medium relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">⏳</span>
            <span className="text-purple-200 tracking-wide">Counting down to a special day...</span>
          </div>
          <div className="flex items-center bg-black/40 rounded-lg px-5 py-2 gap-3 font-mono border border-purple-500/20 shadow-inner">
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-xl leading-none font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-[9px] text-purple-300 font-sans tracking-widest mt-1">HRS</span>
            </div>
            <span className="text-xl font-bold animate-pulse text-purple-400">:</span>
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-xl leading-none font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-[9px] text-purple-300 font-sans tracking-widest mt-1">MIN</span>
            </div>
            <span className="text-xl font-bold animate-pulse text-purple-400">:</span>
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-xl leading-none font-bold text-white">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="text-[9px] text-purple-300 font-sans tracking-widest mt-1">SEC</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (eventState === "birthday") {
    return (
      <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 mix-blend-screen animate-pulse" />
        
        {/* Animated Balloons/Emojis floating up */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute text-4xl animate-[float_10s_ease-in-out_infinite] opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-${Math.random() * 20 + 10}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            >
              {['🎈', '🎉', '🎊', '🎁', '🎂'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        {/* Banner */}
        <div className="absolute top-10 transform -rotate-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-6 rounded-2xl shadow-[0_0_50px_rgba(236,72,153,0.5)] border-4 border-white/20 backdrop-blur-md animate-bounce pointer-events-auto hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={triggerConfetti}>
          <h1 className="text-4xl md:text-6xl font-black text-center tracking-tight drop-shadow-2xl">
            🎉 HAPPY 17TH BIRTHDAY <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 filter drop-shadow-lg">
              YABOSEN!
            </span> 🎂
          </h1>
          <p className="text-center mt-3 font-mono text-purple-200 font-bold tracking-widest">
            HAVE AN AMAZING DAY!
          </p>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(-1000px) rotate(360deg); opacity: 0; }
          }
        `}} />
      </div>
    )
  }

  return null
}
