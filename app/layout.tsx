import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { siteConfig } from "@/lib/config"
import { Suspense } from "react"
import { BackgroundMusicPlayer } from "@/components/background-music-player"

export const viewport: Viewport = {
  themeColor: '#7c3aed',
}

export const metadata: Metadata = {
  title: `${siteConfig.name} - Links`,
  description: siteConfig.bio,
  metadataBase: new URL('https://yabosen.live'),
  openGraph: {
    title: `${siteConfig.name} - Links`,
    description: siteConfig.bio,
    url: 'https://yabosen.live',
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Links`,
    description: siteConfig.bio,
  },
  icons: {
    icon: "/icon-mos.png",
    shortcut: "/emo-avatar.png",
    apple: "/emo-avatar.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <BackgroundMusicPlayer />
        <Analytics />
      </body>
    </html>
  )
}
