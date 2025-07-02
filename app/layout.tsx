import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prime Mates Board Club - Where Board Culture Meets Digital Innovation",
  description:
    "Join the ultimate board sports community featuring NFT collections, games, merch, and events for skate, surf, and snow enthusiasts. Shaka forever! 🤙",
  keywords: "NFT, skateboarding, surfing, snowboarding, board sports, gaming, metaverse, community",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Navigation />
        <div className="pt-20">{children}</div>
      </body>
    </html>
  )
}
