"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Zap, Skull } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export function NFTShowcase() {
  const [hoveredNFT, setHoveredNFT] = useState<number | null>(null)

  const nfts = [
    {
      id: 1,
      name: "Skate Ape #001",
      price: "2.5 ETH",
      rarity: "Legendary",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 2,
      name: "Surf Mate #042",
      price: "1.8 ETH",
      rarity: "Epic",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 3,
      name: "Snow Rider #123",
      price: "2.1 ETH",
      rarity: "Rare",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 4,
      name: "Street King #089",
      price: "3.2 ETH",
      rarity: "Mythic",
      image: "/placeholder.svg?height=400&width=400",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-white">NFT COLLECTION</h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto mb-8">
            Own a piece of board culture history. Each Prime Mate NFT grants exclusive access to our metaverse, special
            events, and community perks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/mint">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#fdc730] to-yellow-500 hover:from-[#fdc730]/90 hover:to-yellow-500/90 text-black font-bold"
              >
                <Zap className="mr-2 h-5 w-5" />
                Mint PMBC
              </Button>
            </Link>
            <Link href="/mint-pttb">
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-600/90 hover:to-red-500/90 text-white font-bold"
              >
                <Skull className="mr-2 h-5 w-5" />
                Mint PTTB
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {nfts.map((nft, index) => (
            <Card
              key={nft.id}
              className="bg-black/50 border-purple-500/30 hover:border-purple-400 transition-all duration-300 overflow-hidden group"
              onMouseEnter={() => setHoveredNFT(index)}
              onMouseLeave={() => setHoveredNFT(null)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  className={`w-full h-64 object-cover transition-transform duration-300 ${
                    hoveredNFT === index ? "scale-110" : "scale-100"
                  }`}
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    {nft.rarity}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">{nft.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-400">{nft.price}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white bg-transparent"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
