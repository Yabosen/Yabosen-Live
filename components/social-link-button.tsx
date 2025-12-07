import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Youtube,
  Twitter,
  Instagram,
  TwitchIcon,
  MessageCircle,
  Music,
  Github,
  Linkedin,
  Mail,
  Globe,
  ExternalLink,
  Radio,
  Gamepad2,
  Camera,
  Headphones,
  Music2,
  GitBranch,
  Users,
  Cloud,
  Palette,
  Code,
  Star,
  Zap,
  Hash,
  Shield,
  Link,
  FileText,
  Disc,
  Mic,
  MessageSquare,
} from "lucide-react"

interface SocialLinkButtonProps {
  name: string
  url: string
  icon: string
  variant?: "full" | "icon"
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  twitter: Twitter,
  instagram: Instagram,
  twitch: TwitchIcon,
  discord: MessageCircle,
  tiktok: Music,
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  website: Globe,
  spotify: Headphones,
  soundcloud: Cloud,
  reddit: Users,
  steam: Gamepad2,
  kick: Radio,
  youtubemusic: Music2,
  myanimelist: Star,
  faceit: Gamepad2,
  pinterest: Camera,
  gitlab: GitBranch,
  vk: Users,
  chessdotcom: Gamepad2,
  gamejolt: Gamepad2,
  mastodon: MessageSquare,
  itchio: Gamepad2,
  codeberg: Code,
  pixiv: Palette,
  matrix: Hash,
  rumble: Radio,
  trovo: Radio,
  lastfm: Disc,
  settingsgg: Gamepad2,
  trustpilot: Shield,
  konectgg: Link,
  gunslol: Zap,
  bluesky: Cloud,
  namemc: Gamepad2,
  carrd: Link,
  librefm: Disc,
  listenbrainz: Mic,
  guilded: MessageSquare,
  pastebin: FileText,
  anilist: Star,
  revolt: MessageSquare,
}

export function SocialLinkButton({ name, url, icon, variant = "full" }: SocialLinkButtonProps) {
  const IconComponent = iconMap[icon.toLowerCase()] || ExternalLink

  // Icon-only variant for grid display
  if (variant === "icon") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center h-12 w-12 bg-muted/50 hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary rounded-lg transition-all duration-300 group"
        title={name}
      >
        <IconComponent className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </a>
    )
  }

  // Full-width variant for featured links
  return (
    <Button
      asChild
      variant="outline"
      className="w-full h-14 text-lg font-medium bg-card hover:bg-primary hover:text-primary-foreground border-border hover:border-primary transition-all duration-300 group"
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <IconComponent className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
        {name}
        <ExternalLink className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100" />
      </a>
    </Button>
  )
}
