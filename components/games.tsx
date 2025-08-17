"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Coins, ExternalLink } from "lucide-react"

export function Games() {
  const games = [
    {
      title: "Prime City",
      subtitle: "The PMBC Metaverse",
      status: "In Development",
      description:
        "Ride. Build. Own. Enter the ultimate board sports metaverse — skate, surf, and snow your way through an open world where you can own land, create your lifestyle, and grow a career. Powered by NFTs and tokens, your journey is truly yours.",
      image: "/images/prime-city.jpg",
      features: ["Open World", "Land Ownership", "NFT Integration", "Career Mode", "Virtual Economy"],
      releaseDate: "2025 Q4",
      gameUrl: null, // Beta waitlist only
    },
    {
      title: "Prime Boarder",
      subtitle: "3D Endless Skater/Surfer/Snow Boarder",
      status: "Available Now",
      description:
        "Prime Boarder is a Web3 endless boarder game that takes you through epic skate, surf, and snowboarding adventures. Play as your custom Prime Mates ape, dodge obstacles, collect rewards, and unlock NFTs. Experience the thrill at prime boarder.",
      image: "/images/prime-boarder.jpg",
      features: ["Endless Runner", "Custom Characters", "NFT Rewards", "Multi-Sport", "Web3 Integration"],
      downloads: "50K+",
      gameUrl: "https://app.primearcade.io/?ref=7432766311",
    },
    {
      title: "Prime Island",
      subtitle: "Spatial Island",
      status: "Available Now",
      description:
        "Welcome to Prime Mates Island in the Spatial Metaverse! This vibrant tropical paradise features a crashed plane, a festival mountain for epic events, a thrilling skatepark, and a surf park for endless fun. Explore, connect, and experience unique adventures in this one-of-a-kind island.",
      image: "/images/prime-island.jpg",
      features: ["VR/AR Ready", "Social Events", "Skate Park", "Surf Park", "Festival Mountain"],
      downloads: "25K+",
      gameUrl: "https://www.spatial.io/s/island-66c38f390300d9b2b814d2b3",
    },
    {
      title: "Skateboard Challenger",
      subtitle: "2D Side-Scrolling Skateboard Game",
      status: "Available Now",
      description:
        "Skateboard Challenge is a side-scrolling skate game where you shred the streets, dodge obstacles, and pull off tricks. Test your skills and conquer the challenge.",
      image: "/images/skateboard-challenger.jpg",
      features: ["Side-Scrolling", "Trick System", "Street Skating", "Obstacle Course", "Score Challenge"],
      downloads: "75K+",
      gameUrl: "https://app.primearcade.io/?ref=7432766311",
    },
    {
      title: "Prime Pixel",
      subtitle: "Pixel-Style Skater Platformer",
      status: "Available Now",
      description:
        "Skater Monkey is a pixel art platformer featuring a skateboarding ape with customizable outfits. Explore levels, perform tricks, and personalize your character.",
      image: "/images/prime-pixel.jpg",
      features: ["Pixel Art", "Platformer", "Character Customization", "Retro Style", "Level Exploration"],
      downloads: "40K+",
      gameUrl: "https://app.primearcade.io/?ref=7432766311",
    },
  ]

  return (
    <section id="games" className="py-20 bg-black relative">
      {/* Floating Shaka Coins */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-32 right-20 w-18 h-18 animate-pulse delay-300"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute bottom-32 left-16 w-14 h-14 animate-pulse delay-1000"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-yellow-400">GAME UNIVERSE</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience board culture like never before in our collection of immersive games. From our metaverse to
            mobile experiences - plus earn Shaka tokens in our Prime Arcade platform!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Featured Game - Prime City (Full Width) */}
          <div className="lg:col-span-2">
            <Card className="bg-black border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 overflow-hidden group">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative overflow-hidden">
                  <img
                    src={games[0].image || "/placeholder.svg"}
                    alt={games[0].title}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-600 text-black font-bold">{games[0].status}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400 bg-black/50">
                      {games[0].releaseDate}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-2 text-yellow-400">{games[0].title}</h3>
                  <p className="text-lg text-yellow-300 mb-4">{games[0].subtitle}</p>
                  <p className="text-gray-300 mb-6">{games[0].description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {games[0].features.map((feature, i) => (
                      <Badge key={i} variant="outline" className="border-yellow-400/50 text-yellow-400">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg"
                    onClick={() => {
                      // For Prime City, show beta waitlist (could link to a signup form)
                      alert("Beta waitlist coming soon! Follow us on social media for updates.")
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Join Beta Waitlist
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Other Games */}
          {games.slice(1).map((game, index) => (
            <Card
              key={index + 1}
              className="bg-black border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={game.image || "/placeholder.svg"}
                  alt={game.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600 text-white font-bold">{game.status}</Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-1 text-white">{game.title}</h3>
                <p className="text-sm text-yellow-400 mb-3">{game.subtitle}</p>
                <p className="text-gray-300 text-sm mb-4">{game.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {game.features.slice(0, 3).map((feature, i) => (
                    <Badge key={i} variant="outline" className="border-yellow-400/50 text-yellow-400 text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {game.downloads && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400">
                      Downloads: <span className="text-yellow-400 font-bold">{game.downloads}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-lg text-sm"
                    onClick={() => window.open(game.gameUrl, "_blank")}
                  >
                    <Play className="mr-2 h-3 w-3" />
                    Play Now
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent rounded-lg"
                    onClick={() => window.open(game.gameUrl, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="grid md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">5</div>
              <div className="text-gray-300">Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">190K+</div>
              <div className="text-gray-300">Total Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">75K+</div>
              <div className="text-gray-300">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">4.8</div>
              <div className="text-gray-300">Avg Rating</div>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-lg"
            onClick={() => window.open("https://app.primearcade.io/?ref=7432766311", "_blank")}
          >
            <Coins className="mr-2 h-5 w-5" />
            Play to Earn in Prime Arcade
          </Button>
        </div>
      </div>
    </section>
  )
}
