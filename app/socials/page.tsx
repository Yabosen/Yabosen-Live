// Socials page implementation
import { siteConfig } from "@/lib/config"
import { AnimatedAvatar } from "@/components/animated-avatar"
import {
  Twitch,
  Youtube,
  Radio,
  Music,
  PlayCircle,
  Twitter,
  Send,
  Disc3,
  Gamepad2,
  ExternalLink
} from "lucide-react"

interface SocialLinkProps {
  name: string
  url: string
  icon: React.ReactNode
}

function SocialLink({ name, url, icon }: SocialLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group w-full max-w-lg flex items-center justify-between
        bg-white/5 backdrop-blur-md border border-white/10
        px-6 py-4 rounded-full
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:bg-white/10 hover:border-white/20
        active:scale-[0.98]
        hover:shadow-lg hover:shadow-purple-900/20
      "
    >
      <span className="font-medium text-zinc-100 text-lg group-hover:text-purple-300 transition-colors">
        {name}
      </span>
      <div className="text-zinc-400 group-hover:text-purple-400 transition-colors">
        {icon}
      </div>
    </a>
  )
}

export default function SocialsPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center py-12 px-4 relative overflow-y-auto w-full"
      style={{
        backgroundImage: "url('/socials-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none fixed" />

      <div className="z-10 w-full flex flex-col items-center space-y-8 max-w-xl mx-auto pb-12">
        {/* Avatar & Header */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-2">
            <AnimatedAvatar
              src="/emo-avatar.png"
              alt={siteConfig.name}
              size={120}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-wide">
              {siteConfig.name}
            </h1>
            {/* <p className="text-zinc-300 font-medium drop-shadow-sm text-sm">
              {siteConfig.bio}
            </p> */}
          </div>
        </div>

        {/* Links List - Wide Bars */}
        <div className="w-full flex flex-col items-center space-y-4">
          <SocialLink
            name="Twitch"
            url="https://www.twitch.tv/yab0sen"
            icon={<Twitch className="h-6 w-6" />}
          />
          <SocialLink
            name="YouTube"
            url="https://www.youtube.com/@Yabosen"
            icon={<Youtube className="h-6 w-6" />}
          />
          <SocialLink
            name="Kick"
            url="https://kick.com/yabosen"
            icon={<Radio className="h-6 w-6" />}
          />
          <SocialLink
            name="TikTok"
            url="https://www.tiktok.com/@yabosen56"
            icon={<Music className="h-6 w-6" />}
          />
          <SocialLink
            name="YT Music"
            url="https://music.youtube.com/channel/UCjCPjfkiQF16MSoL8QQyW8A"
            icon={<PlayCircle className="h-6 w-6" />}
          />
          <SocialLink
            name="Twitter"
            url="https://x.com/Yabosen56"
            icon={<Twitter className="h-6 w-6" />}
          />
          <SocialLink
            name="Telegram"
            url="https://t.me/yabosen"
            icon={<Send className="h-6 w-6" />}
          />
          <SocialLink
            name="Last.fm"
            url="https://www.last.fm/user/LutyLutanu606"
            icon={<Disc3 className="h-6 w-6" />}
          />
          <SocialLink
            name="Steam Profile"
            url="https://steamcommunity.com/id/Yabosen/"
            icon={<Gamepad2 className="h-6 w-6" />}
          />
        </div>
      </div>
    </main>
  )
}

