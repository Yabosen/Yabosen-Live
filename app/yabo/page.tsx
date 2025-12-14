import { siteConfig } from "@/lib/config"
import { SocialLinkButton } from "@/components/social-link-button"
import { TopNav } from "@/components/top-nav"
import { PersonalInfo } from "@/components/personal-info"
import { CSStats } from "@/components/cs-stats"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RickRollEasterEgg } from "@/components/rickroll-easter-egg"

export default function YaboPage() {
  return (
    <>
      <RickRollEasterEgg />
      <TopNav />

      <main className="min-h-screen bg-background pt-14">
        <div className="container max-w-3xl mx-auto px-4 py-12">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mb-8">
            <Avatar className="h-32 w-32 mb-6 ring-4 ring-primary/20">
              <AvatarImage src={siteConfig.avatarUrl || "/placeholder.svg"} alt={siteConfig.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {siteConfig.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-5xl md:text-6xl font-bold mb-4">{siteConfig.name}</h1>
          </div>

          <PersonalInfo />

          <CSStats />

          {/* My Socials Heading */}
          <h2 className="text-2xl font-bold mb-6">My Socials:</h2>

          {/* Featured Social Links */}
          <div className="space-y-3 mb-8">
            {siteConfig.featuredSocialLinks.map((link) => (
              <SocialLinkButton key={link.url} name={link.name} url={link.url} icon={link.icon} variant="full" />
            ))}
          </div>

          {/* Social Icons Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-3 mb-12">
            {siteConfig.socialLinks.map((link, index) => (
              <SocialLinkButton
                key={`${link.url}-${index}`}
                name={link.name}
                url={link.url}
                icon={link.icon}
                variant="icon"
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">My Communities:</h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-3 mb-12">
            {siteConfig.communities.map((community, index) => (
              <SocialLinkButton
                key={`${community.url}-${index}`}
                name={community.name}
                url={community.url}
                icon={community.icon}
                variant="icon"
              />
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-muted-foreground text-sm mt-12">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </main>
    </>
  )
}
