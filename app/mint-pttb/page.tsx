"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import {
  Wallet,
  Plus,
  Minus,
  ExternalLink,
  Users,
  Clock,
  Zap,
  Gift,
  Star,
  Trophy,
  Skull,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { web3Service } from "@/lib/web3"

const CONTRACT_ADDRESS = "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75"

const PTTB_ARTWORKS = [
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8875.PNG-UfJS6bLCgHIycoiaj9kpwx4DnI9aKS.png",
    name: "Skeletal Vision",
    rarity: "Legendary",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_9024.PNG-vFwNVL999XD0WKX3rC7DrpGH2wL4vy.png",
    name: "Flame Eyes",
    rarity: "Epic",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a8efbc8e7d0017f265819249c000c51e.PNG-fhX8wTNxd2CuEg35V0rMBu6uNUsWoi.jpeg",
    name: "Afro Skull",
    rarity: "Rare",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6828.jpg-55Te2DJM4h3XrfQqgUlYjYyWty0HWd.jpeg",
    name: "Crown Bones",
    rarity: "Legendary",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_9313.jpg-ard3feesbToBM0qzMIQUwFr1vaJk9J.jpeg",
    name: "Colorful Decay",
    rarity: "Epic",
  },
]

export default function MintPTTBPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [mintQuantity, setMintQuantity] = useState(1)
  const [isMinting, setIsMinting] = useState(false)
  const [totalSupply, setTotalSupply] = useState(439)
  const [maxSupply, setMaxSupply] = useState(999)
  const [mintPrice, setMintPrice] = useState(85) // 85 MATIC for public
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0)

  useEffect(() => {
    loadCollectionStats()
    const artworkInterval = setInterval(() => {
      setCurrentArtworkIndex((prev) => (prev + 1) % PTTB_ARTWORKS.length)
    }, 4000)

    return () => clearInterval(artworkInterval)
  }, [])

  const loadCollectionStats = async () => {
    setIsLoadingStats(true)
    try {
      const stats = await web3Service.getCollectionStats(CONTRACT_ADDRESS)
      if (stats.maxSupply === 999) {
        setTotalSupply(stats.totalSupply)
        setMaxSupply(stats.maxSupply)
        setMintPrice(Number.parseFloat(stats.mintPrice))
      }
    } catch (error) {
      console.error("Failed to load collection stats:", error)
      setTotalSupply(439)
      setMaxSupply(999)
      setMintPrice(85)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const connectWallet = async () => {
    try {
      const address = await web3Service.connectWallet()
      if (address) {
        setWalletAddress(address)
        setIsConnected(true)
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        })
      } else {
        throw new Error("Failed to connect wallet")
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const mintNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    try {
      console.log("[v0] Starting mint process for", mintQuantity, "PTTB NFTs")

      const txHash = await web3Service.mintNFT(mintQuantity, CONTRACT_ADDRESS)

      if (txHash) {
        await loadCollectionStats()

        toast({
          title: "Minting Successful!",
          description: (
            <div>
              <p>
                Successfully minted {mintQuantity} Prime to the Bone NFT{mintQuantity > 1 ? "s" : ""}!
              </p>
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-sm"
              >
                View on Etherscan →
              </a>
            </div>
          ),
        })
      }
    } catch (error: any) {
      console.error("Minting error:", error)
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  const adjustQuantity = (change: number) => {
    const newQuantity = mintQuantity + change
    if (newQuantity >= 1 && newQuantity <= 10) {
      setMintQuantity(newQuantity)
    }
  }

  const nextArtwork = () => {
    setCurrentArtworkIndex((prev) => (prev + 1) % PTTB_ARTWORKS.length)
  }

  const prevArtwork = () => {
    setCurrentArtworkIndex((prev) => (prev - 1 + PTTB_ARTWORKS.length) % PTTB_ARTWORKS.length)
  }

  const currentArtwork = PTTB_ARTWORKS[currentArtworkIndex]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-[#fdc730]/5 animate-pulse" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-red-600 text-white hover:bg-red-600/90 shadow-lg shadow-red-600/20">
              Prime to the Bone
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 via-[#fdc730] to-red-400 bg-clip-text text-transparent drop-shadow-lg">
              PTTB Collection
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              999 hand-drawn spooky NFTs with over 100 distinctive traits. Free merch, staking rewards, and gamified
              experiences await!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* NFT Preview */}
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="relative aspect-square bg-gradient-to-br from-red-500/20 to-[#fdc730]/20 rounded-lg mb-4 border-2 border-red-500/30 shadow-lg shadow-red-500/10 overflow-hidden">
                    <img
                      src={currentArtwork.url || "/placeholder.svg"}
                      alt={currentArtwork.name}
                      className="w-full h-full object-cover rounded-lg transition-all duration-500"
                    />

                    {/* Navigation arrows */}
                    <button
                      onClick={prevArtwork}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextArtwork}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Artwork indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                      {PTTB_ARTWORKS.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentArtworkIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            index === currentArtworkIndex ? "bg-red-400 w-6" : "bg-white/30 hover:bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-red-400">{currentArtwork.name}</h3>
                      <p className="text-gray-400">Prime to the Bone</p>
                    </div>
                    <Badge variant="outline" className="border-red-500 text-red-400 shadow-sm shadow-red-500/20">
                      {currentArtwork.rarity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Collection Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-900/30 border-gray-800 border-t-2 border-t-red-500">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400">
                      {isLoadingStats ? "..." : totalSupply.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Minted</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/30 border-gray-800 border-t-2 border-t-red-500">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400">{maxSupply.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Supply</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/30 border-gray-800 border-t-2 border-t-red-500">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400">
                      {isLoadingStats ? "..." : `${mintPrice} MATIC`}
                    </div>
                    <div className="text-sm text-gray-400">Public Price</div>
                  </CardContent>
                </Card>
              </div>

              {/* Minting Progress */}
              <Card className="bg-gray-900/30 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-red-400">Minting Progress</span>
                    <span className="text-sm text-red-400 font-bold">
                      {Math.round((totalSupply / maxSupply) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-300 shadow-sm shadow-red-500/30"
                      style={{ width: `${(totalSupply / maxSupply) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{maxSupply - totalSupply} NFTs remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Minting Interface */}
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-2xl text-red-400">Mint Prime to the Bone</CardTitle>
                  <CardDescription>Connect your wallet and join the skeletal collection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Wallet Connection */}
                  {!isConnected ? (
                    <Button
                      onClick={connectWallet}
                      className="w-full bg-red-600 hover:bg-red-600/90 text-white font-semibold py-3 shadow-lg shadow-red-600/20"
                      size="lg"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet
                    </Button>
                  ) : (
                    <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Connected Wallet</p>
                          <p className="font-mono text-green-400">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </p>
                        </div>
                        <Badge className="bg-green-900 text-green-300">Connected</Badge>
                      </div>
                    </div>
                  )}

                  <Separator className="bg-gray-800" />

                  {/* Quantity Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-red-400">Quantity (Max 10)</Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(-1)}
                        disabled={mintQuantity <= 1}
                        className="border-gray-700 hover:bg-red-500/10 hover:border-red-500"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={mintQuantity}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value)
                          if (val >= 1 && val <= 10) setMintQuantity(val)
                        }}
                        className="w-20 text-center bg-gray-900 border-gray-700 focus:border-red-500 text-red-400 font-bold"
                        min="1"
                        max="10"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(1)}
                        disabled={mintQuantity >= 10}
                        className="border-gray-700 hover:bg-red-500/10 hover:border-red-500"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Price Calculation */}
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-red-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Public Price</span>
                      <span className="font-semibold text-red-400">{mintPrice} MATIC</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">PMBC/Whitelist</span>
                      <span className="font-semibold text-[#fdc730]">69 MATIC</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Quantity</span>
                      <span className="font-semibold text-red-400">{mintQuantity}</span>
                    </div>
                    <Separator className="bg-gray-700 my-2" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-red-400 text-xl">{mintPrice * mintQuantity} MATIC</span>
                    </div>
                  </div>

                  {/* Mint Button */}
                  <Button
                    onClick={mintNFT}
                    disabled={!isConnected || isMinting}
                    className="w-full bg-red-600 hover:bg-red-600/90 text-white font-semibold py-3 shadow-lg shadow-red-600/30 hover:shadow-red-600/40 transition-all duration-200"
                    size="lg"
                  >
                    {isMinting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Minting...
                      </>
                    ) : (
                      `Mint ${mintQuantity} NFT${mintQuantity > 1 ? "s" : ""}`
                    )}
                  </Button>

                  {/* Contract Info */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-400 mb-2">Contract Address</p>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="text-xs bg-gray-900 px-2 py-1 rounded font-mono border border-red-500/20">
                        {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://etherscan.io/address/${CONTRACT_ADDRESS}`, "_blank")}
                        className="hover:bg-red-500/10"
                      >
                        <ExternalLink className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-[#fdc730] bg-clip-text text-transparent">
            Prime to the Bone Benefits
          </h2>
          <p className="text-xl text-gray-400">
            666 public mint + 333 community reserved • Free merch & T-shirts for all minters
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/30 border-gray-800 hover:border-red-500/50 transition-colors duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/30">
                <Gift className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-red-400">Free Merch</h3>
              <p className="text-gray-400 text-sm">All minters receive free merchandise and T-shirt options</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/30 border-gray-800 hover:border-red-500/50 transition-colors duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/30">
                <Star className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-red-400">Staking Rewards</h3>
              <p className="text-gray-400 text-sm">Earn passive rewards through our staking system</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/30 border-gray-800 hover:border-red-500/50 transition-colors duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/30">
                <Trophy className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-red-400">Gamified Experiences</h3>
              <p className="text-gray-400 text-sm">Interactive adventures and gaming utilities</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/30 border-gray-800 hover:border-red-500/50 transition-colors duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/30">
                <Skull className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-red-400">100+ Traits</h3>
              <p className="text-gray-400 text-sm">Over 100 distinctive traits make each NFT unique</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-red-500/10 to-[#fdc730]/10 border-red-500/30 shadow-lg shadow-red-500/10">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-red-400 mb-4">💀 Dive into the Spooky World</h3>
              <p className="text-lg text-gray-300 mb-6">
                The Prime To The Bone collection features 999 hand-drawn NFTs with a spooky Halloween twist! With 666
                available for public mint and 333 reserved for our community, each holder gets exclusive merch claims,
                staking rewards, and gamified benefits in our world of adventure.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => window.open("https://opensea.io/collection/prime-to-the-bone", "_blank")}
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  View on OpenSea
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("https://pmbc.store/prime-to-the-bone/", "_blank")}
                  className="border-[#fdc730] text-[#fdc730] hover:bg-[#fdc730]/10"
                >
                  PMBC Store
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
