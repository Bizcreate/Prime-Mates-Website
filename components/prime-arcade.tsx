"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Coins, Trophy, Users, ExternalLink, Gamepad2 } from "lucide-react"
import Image from "next/image"

export function PrimeArcade() {
  const arcadeFeatures = [
    {
      icon: Coins,
      title: "Play to Earn",
      description: "Earn Shaka tokens by playing games and completing challenges",
    },
    {
      icon: Trophy,
      title: "Competitions",
      description: "Join tournaments and compete for massive Shaka token prizes",
    },
    {
      icon: Gamepad2,
      title: "Multiple Games",
      description: "Access a variety of games all in one arcade platform",
    },
    {
      icon: Users,
      title: "Community Rewards",
      description: "Bonus rewards for PMBC NFT holders and community members",
    },
  ]

  const stats = [
    { value: "50K+", label: "Active Players" },
    { value: "1M+", label: "Shaka Earned" },
    { value: "25+", label: "Games Available" },
    { value: "500+", label: "Daily Tournaments" },
  ]

  return (
    <section id="prime-arcade" className="py-20 bg-black relative">
      {/* Floating Shaka Coins */}
      <div className="absolute inset-0 overflow-hidden opacity-15">
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-16 left-16 w-24 h-24 animate-pulse"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-40 right-12 w-16 h-16 animate-pulse delay-500"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute bottom-20 left-1/3 w-20 h-20 animate-pulse delay-1000"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Image src="/images/shaka-coin.png" alt="Shaka Coin" width={80} height={80} className="mr-4" />
            <div>
              <h2 className="text-5xl font-black text-yellow-400">PRIME ARCADE</h2>
              <p className="text-xl text-yellow-300">Play to Earn Shaka Tokens</p>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Experience the ultimate gaming destination where every game you play earns you Shaka tokens. Our all-in-one
            arcade platform combines the best games with a rewarding token economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 rounded-lg"
              onClick={() => window.open("https://app.primearcade.io/?ref=7432766311", "_blank")}
            >
              <Play className="mr-2 h-5 w-5" />
              Play Now & Earn
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent font-bold px-8 rounded-lg"
            >
              <Coins className="mr-2 h-5 w-5" />
              Learn About Shaka
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {arcadeFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-black border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 group"
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <feature.icon className="h-12 w-12 text-yellow-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Shaka Token Economy */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <Card className="bg-black border-yellow-400/50">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Image src="/images/shaka-coin.png" alt="Shaka Coin" width={60} height={60} className="mr-4" />
                <div>
                  <h3 className="text-3xl font-bold text-yellow-400">SHAKA TOKEN</h3>
                  <p className="text-yellow-300">Our Gaming Economy Currency</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Earn by Playing</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tournament Prizes</span>
                  <Badge className="bg-blue-600">Daily</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">NFT Holder Bonuses</span>
                  <Badge className="bg-purple-600">Exclusive</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Marketplace Trading</span>
                  <Badge className="bg-yellow-600">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">How to Start Earning</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Join Prime Arcade</h4>
                    <p className="text-gray-400">Create your account and connect your wallet</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Play Games</h4>
                    <p className="text-gray-400">Choose from 25+ games and start earning Shaka</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Earn & Compete</h4>
                    <p className="text-gray-400">Join tournaments for bigger rewards</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-black text-yellow-400 mb-2">{stat.value}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-yellow-400 border-0 inline-block">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-black mb-4">Ready to Start Earning?</h3>
              <p className="text-black/80 mb-6">Join thousands of players earning Shaka tokens daily</p>
              <Button
                size="lg"
                className="bg-black text-yellow-400 hover:bg-gray-900 font-bold px-8 rounded-lg"
                onClick={() => window.open("https://app.primearcade.io/?ref=7432766311", "_blank")}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Launch Prime Arcade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
