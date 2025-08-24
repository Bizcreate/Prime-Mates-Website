"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Eye, Zap } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export function NFTCollections() {
  const [hoveredNFT, setHoveredNFT] = useState<number | null>(null)

  const collections = [
    {
      id: 1,
      name: "Prime Mates Board Club",
      description:
        "The original collection featuring our iconic characters in board sports action with that classic shaka spirit",
      floorPrice: "0.05 ETH",
      totalSupply: "2,222",
      image: "/images/nft-pmbc.png",
      openseaUrl: "https://opensea.io/collection/pmbc",
      mintUrl: "/mint",
      status: "Live",
    },
    {
      id: 2,
      name: "Prime To The Bone",
      description: "Skeletal board riders bringing X-ray vibes to the metaverse with digital aesthetics",
      floorPrice: "85 Poly",
      totalSupply: "999",
      image: "/images/nft-prime-to-bone.png",
      openseaUrl: "https://opensea.io/collection/prime-to-the-bone",
      mintUrl: "/mint-pttb",
      status: "Live",
    },
    {
      id: 3,
      name: "Prime Halloween",
      description: "Limited Halloween edition with devilish themes and hellish board club vibes",
      floorPrice: "0.005 ETH",
      totalSupply: "666",
      image: "/images/nft-halloween.png",
      openseaUrl: "https://opensea.io/collection/prime-halloween-board-club",
      mintUrl: null,
      status: "Limited",
    },
    {
      id: 4,
      name: "Prime Mates Christmas Club",
      description: "Festive holiday collection spreading board culture Christmas cheer in the snow",
      floorPrice: "24 Poly",
      totalSupply: "1111",
      image: "/images/nft-christmas.png",
      openseaUrl: "https://opensea.io/collection/prime-mates-christmas-club",
      mintUrl: null,
      status: "Seasonal",
    },
  ]

  return (
    <section id="nfts" className="py-20 bg-black relative">
      {/* Floating Shaka Coins */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute top-20 left-1/4 w-20 h-20 animate-pulse"
        />
        <img
          src="/images/shaka-coin.png"
          alt="Shaka Coin"
          className="absolute bottom-40 right-1/4 w-16 h-16 animate-pulse delay-700"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-yellow-400">NFT COLLECTIONS</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Own a piece of board culture history. Each Prime Mate NFT grants exclusive access to our metaverse, special
            events, and community perks. Collect them all on OpenSea!
          </p>
          <Button
            size="lg"
            className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-lg"
            onClick={() => window.open("https://opensea.io/collection/pmbc", "_blank")}
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            View on OpenSea
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((collection, index) => (
            <Card
              key={collection.id}
              className="bg-black border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 overflow-hidden group"
              onMouseEnter={() => setHoveredNFT(index)}
              onMouseLeave={() => setHoveredNFT(null)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  className={`w-full h-64 object-cover transition-transform duration-300 ${
                    hoveredNFT === index ? "scale-110" : "scale-100"
                  }`}
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    variant="secondary"
                    className={`${
                      collection.status === "Live"
                        ? "bg-green-600"
                        : collection.status === "Limited"
                          ? "bg-red-600"
                          : "bg-blue-600"
                    } text-white`}
                  >
                    {collection.status}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {collection.mintUrl && (
                    <Link href={collection.mintUrl}>
                      <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-bold rounded-lg shadow-lg">
                        <Zap className="mr-2 h-4 w-4" />
                        Mint Now
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 font-bold rounded-lg bg-transparent"
                    onClick={() => window.open(collection.openseaUrl, "_blank")}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Collection
                  </Button>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">{collection.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{collection.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Original Mint Price</p>
                    <p className="text-lg font-bold text-yellow-400">{collection.floorPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Supply</p>
                    <p className="text-lg font-bold text-white">{collection.totalSupply}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {collection.mintUrl && (
                    <Link href={collection.mintUrl}>
                      <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-bold rounded-lg shadow-lg">
                        <Zap className="mr-2 h-4 w-4" />
                        Mint Now
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 font-bold rounded-lg bg-transparent"
                    onClick={() => window.open(collection.openseaUrl, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on OpenSea
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Collection Stats */}
        <div className="text-center mt-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">20.5K</div>
              <div className="text-gray-300">Total NFTs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">5K+</div>
              <div className="text-gray-300">Holders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">15+</div>
              <div className="text-gray-300">ETH Volume</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
