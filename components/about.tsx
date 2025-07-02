import { Card, CardContent } from "@/components/ui/card"
import { Gamepad2, Palette, Calendar, ShoppingBag } from "lucide-react"
import Image from "next/image"

export function About() {
  const features = [
    {
      icon: Palette,
      title: "NFT Collections",
      description: "Multiple unique collections on OpenSea representing board culture and community membership",
    },
    {
      icon: Gamepad2,
      title: "Game Development",
      description: "Three released games plus an upcoming metaverse experience with GTA x Tony Hawk vibes",
    },
    {
      icon: ShoppingBag,
      title: "Merch & Apparel",
      description: "Premium clothing and gear designed by riders, for the board sports community",
    },
    {
      icon: Calendar,
      title: "Events & Sponsorships",
      description: "Supporting athletes and organizing epic board sports events worldwide",
    },
  ]

  return (
    <section id="about" className="py-20 bg-black relative">
      {/* Floating Shaka Coins */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-10 right-10 w-16 h-16 animate-pulse"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute bottom-20 left-10 w-12 h-12 animate-pulse delay-500"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="mb-8">
            <Image src="/images/banana-logo.png" alt="Prime Mates" width={100} height={100} className="mx-auto mb-4" />
          </div>
          <h2 className="text-5xl font-black mb-6 text-yellow-400">MORE THAN JUST A BRAND</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Prime Mates Board Club is a revolutionary ecosystem that bridges the gap between traditional board sports
            and the digital frontier. We're building the future of board culture, one shaka at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
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

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-black text-yellow-400 mb-2">4</div>
            <div className="text-gray-300">NFT Collections</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-yellow-400 mb-2">3+</div>
            <div className="text-gray-300">Games Released</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-yellow-400 mb-2">1</div>
            <div className="text-gray-300">Gaming Arcade</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-yellow-400 mb-2">10K+</div>
            <div className="text-gray-300">Community Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-yellow-400 mb-2">50+</div>
            <div className="text-gray-300">Events Sponsored</div>
          </div>
        </div>
      </div>
    </section>
  )
}
