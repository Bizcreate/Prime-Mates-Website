"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Users, Zap, Instagram, Twitter, Youtube, DiscIcon as Discord, Hash } from "lucide-react"
import { useState } from "react"

export function Community() {
  const [email, setEmail] = useState("")

  const stats = [
    { icon: Users, value: "1000+", label: "Community Members" },
    { icon: MessageCircle, value: "100+", label: "Daily Messages" },
    { icon: Zap, value: "10K", label: "NFTs Owned" },
  ]

  const socialLinks = [
    { icon: Discord, label: "Discord", href: "#", color: "hover:text-purple-400", members: "4K" },
    { icon: Twitter, label: "Twitter", href: "#", color: "hover:text-blue-400", members: "9K" },
    { icon: Instagram, label: "Instagram", href: "#", color: "hover:text-pink-400", members: "3K" },
    { icon: Youtube, label: "YouTube", href: "#", color: "hover:text-red-400", members: "1K" },
  ]

  const communityFeatures = [
    {
      title: "Discord Community",
      description: "Join our active Discord server for daily discussions, events, and exclusive drops",
      icon: Discord,
    },
    {
      title: "NFT Holder Benefits",
      description: "Exclusive access to events, early game releases, and special merchandise",
      icon: Zap,
    },
    {
      title: "User Generated Content",
      description: "Share your board tricks, art, and creativity with the community",
      icon: Hash,
    },
  ]

  return (
    <section id="community" className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-yellow-400">JOIN THE COMMUNITY</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connect with fellow board enthusiasts, share your tricks, and be part of the most rad community in the
            metaverse. The shaka spirit lives here!
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-900 border-yellow-400/20 text-center">
              <CardContent className="p-8">
                <stat.icon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {communityFeatures.map((feature, index) => (
            <Card key={index} className="bg-gray-900 border-yellow-400/20 hover:border-yellow-400 transition-colors">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-3xl font-bold text-black mb-4">Stay in the Loop</h3>
              <p className="text-black/80 mb-6">
                Get the latest updates on NFT drops, game releases, exclusive events, and community news.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/90 border-white/50 text-black placeholder:text-black/60"
                />
                <Button className="bg-black text-yellow-400 hover:bg-gray-900 font-bold px-8">Subscribe</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Links */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Follow the Shaka</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {socialLinks.map((social, index) => (
              <Card key={index} className="bg-gray-900 border-yellow-400/20 hover:border-yellow-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <a href={social.href} className={`block text-gray-400 transition-colors ${social.color}`}>
                    <social.icon className="h-8 w-8 mx-auto mb-3" />
                    <div className="font-bold text-white">{social.label}</div>
                    <div className="text-sm text-gray-400">{social.members} members</div>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
