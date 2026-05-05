import { siteConfig } from "@/lib/config"
import { AnimatedAvatar } from "@/components/animated-avatar"
import { LinkCard } from "@/components/link-card"
import { StatusIndicator } from "@/components/status-indicator"
import { LastFmWidget } from "@/components/lastfm-widget"
import { RickRollEasterEgg } from "@/components/rickroll-easter-egg"
import { HiddenCredits } from "@/components/hidden-credits"
import { FaceitWidget } from "@/components/faceit-widget"
import { CS2WingmanWidget } from "@/components/cs2-wingman-widget"
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
      <main className="min-h-screen bg-background flex flex-col items-center">
        {/* Full-width Banner Section */}
        <div className="w-full h-48 sm:h-64 lg:h-80 relative overflow-hidden border-b border-border/10">
          <div 
            className="absolute inset-0 w-full h-full transform hover:scale-105 transition-transform duration-1000 ease-out"
            style={{
              backgroundImage: "url('/My_Lord.png')",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
            }}
          />
          {/* Premium gradient overlays for blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 -mt-20 sm:-mt-24 relative z-10 pb-12">
          {/* Profile Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
            {/* Animated Avatar - wrapped in a premium card-like container */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative p-1.5 bg-background rounded-full border border-white/10 shadow-2xl">
                <AnimatedAvatar
                  src="/api/avatar"
                  alt={siteConfig.name}
                  size={140}
                />
              </div>
            </div>

            {/* Name and Description */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:pt-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2 drop-shadow-sm">
                {siteConfig.name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mb-3 max-w-md">
                {siteConfig.bio}
              </p>
              <StatusIndicator />
              <div className="mt-2 w-full flex flex-wrap justify-center sm:justify-start gap-4">
                <FaceitWidget />
                <CS2WingmanWidget />
              </div>
            </div>
          </div>

          {/* Link Cards Grid */}
          <div className="space-y-4">
            {/* Row 1: Streaming Platforms */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <LinkCard
                name="Twitch"
                url="https://www.twitch.tv/yabosenlikewhy"
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
