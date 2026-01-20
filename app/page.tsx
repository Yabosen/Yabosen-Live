import { siteConfig } from "@/lib/config"
import { AnimatedAvatar } from "@/components/animated-avatar"
import { LinkCard } from "@/components/link-card"
import { StatusIndicator } from "@/components/status-indicator"
import { LastFmWidget } from "@/components/lastfm-widget"
import { RickRollEasterEgg } from "@/components/rickroll-easter-egg"
import { HiddenCredits } from "@/components/hidden-credits"
import {
  TwitchIcon,
  Youtube,
  Radio,
  Music,
  Gamepad2,
  BarChart3,
  Trophy,
  Link as LinkIcon
} from "lucide-react"

export default function Home() {
  return (
    <>
      <RickRollEasterEgg />
      <HiddenCredits />
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl mx-auto">
          {/* Profile Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
            {/* Animated Avatar - now fetches from API */}
            <AnimatedAvatar
              src="/api/avatar"
              alt={siteConfig.name}
              size={140}
            />

            {/* Name and Description */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                {siteConfig.name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mb-3 max-w-md">
                {siteConfig.bio}
              </p>
              <StatusIndicator />
            </div>
          </div>

          {/* Link Cards Grid */}
          <div className="space-y-4">
            {/* Row 1: Streaming Platforms */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <LinkCard
                name="Twitch"
                url="https://www.twitch.tv/yab0sen"
                icon={<TwitchIcon className="h-8 w-8" />}
              />
              <LinkCard
                name="YouTube"
                url="https://www.youtube.com/@Yabosen666"
                icon={<Youtube className="h-8 w-8" />}
              />
              <LinkCard
                name="Kick"
                url="https://kick.com/yabosen"
                icon={<Radio className="h-8 w-8" />}
              />
              <LinkCard
                name="TikTok"
                url="https://www.tiktok.com/@yabosen56"
                icon={<Music className="h-8 w-8" />}
              />
            </div>

            {/* Row 2: Gaming Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <LinkCard
                name="Faceit"
                url="https://www.faceit.com/en/players/Yabosen"
                icon={<Gamepad2 className="h-8 w-8" />}
              />
              <LinkCard
                name="CS Stats"
                url="https://csstats.gg/player/76561198981651703"
                icon={<BarChart3 className="h-8 w-8" />}
              />
              <LinkCard
                name="Leetify"
                url="https://leetify.com/@yabosen"
                icon={<Trophy className="h-8 w-8" />}
              />
            </div>
          </div>

          {/* Last.fm Widget */}
          <div className="mt-8">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Currently Listening</p>
            <LastFmWidget />
          </div>

          {/* Link to full socials page */}
          <div className="mt-12 text-center space-y-3">
            <a
              href="/yabo"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <LinkIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
              View all links & socials
            </a>
            <div>
              <a
                href="/socials"
                className="inline-flex items-center justify-center px-6 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 rounded-full text-sm font-medium text-primary transition-all hover:scale-105 active:scale-95"
              >
                View Full Socials Page
              </a>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-muted-foreground text-xs mt-8">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </main>
    </>
  )
}
