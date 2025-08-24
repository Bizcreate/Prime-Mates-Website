"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Share2, Palette, Loader2 } from "lucide-react"
import { fetchNFTByTokenId } from "@/lib/web3-utils"
import { COLLECTIONS } from "@/lib/web3-config"

interface NFTData {
  tokenId: string
  name: string
  image: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string }>
  owner?: string
}

const gestures = [
  { name: "GM Coffee", icon: "☕", file: "/gestures/gm-coffee.png" },
  { name: "Love Heart", icon: "❤️", file: "/gestures/love-heart.png" },
  { name: "Gold Star", icon: "⭐", file: "/gestures/gold-star.png" },
  { name: "Lightning", icon: "⚡", file: "/gestures/lightning.png" },
  { name: "Golden Crown", icon: "👑", file: "/gestures/golden-crown.png" },
  { name: "Shaka Hand", icon: "🤙", file: "/gestures/shaka-hand.png" },
]

export default function GesturePage() {
  const params = useParams()
  const router = useRouter()
  const [nft, setNft] = useState<NFTData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGesture, setSelectedGesture] = useState<string | null>(null)
  const [gesturePosition, setGesturePosition] = useState("top-right")
  const [gestureSize, setGestureSize] = useState("medium")
  const [gestureOpacity, setGestureOpacity] = useState(80)
  const [walletAddress, setWalletAddress] = useState("")
  const [isOwner, setIsOwner] = useState(false)
  const [accounts, setAccounts] = useState<string[]>([])

  const collection = COLLECTIONS.find((c) => c.name.toLowerCase().replace(/\s+/g, "-") === params.collection)
  const tokenId = params.tokenId as string

  useEffect(() => {
    const checkWalletAndLoadNFT = async () => {
      try {
        // Check if wallet is connected
        if (typeof window.ethereum !== "undefined") {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          setAccounts(accounts)
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
          }
        }

        if (!collection || !tokenId) {
          router.push("/gallery")
          return
        }

        // Load NFT data
        const nftData = await fetchNFTByTokenId(collection.address, Number.parseInt(tokenId), collection.chainId)

        if (nftData) {
          setNft(nftData)
          // Check if connected wallet owns this NFT
          if (accounts.length > 0 && nftData.owner) {
            setIsOwner(accounts[0].toLowerCase() === nftData.owner.toLowerCase())
          }
        } else {
          // NFT not found, redirect back
          router.push("/gallery")
        }
      } catch (error) {
        console.error("[v0] Error loading NFT:", error)
        router.push("/gallery")
      } finally {
        setLoading(false)
      }
    }

    checkWalletAndLoadNFT()
  }, [collection, tokenId, router])

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccounts(accounts)
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          // Recheck ownership
          if (nft?.owner) {
            setIsOwner(accounts[0].toLowerCase() === nft.owner.toLowerCase())
          }
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "gold":
        return "from-yellow-500 to-yellow-600"
      case "red":
        return "from-red-500 to-red-600"
      case "orange":
        return "from-orange-500 to-orange-600"
      case "green":
        return "from-green-500 to-green-600"
      default:
        return "from-yellow-500 to-yellow-600"
    }
  }

  const getGestureStyles = () => {
    const sizeMap = { small: "w-16 h-16", medium: "w-24 h-24", large: "w-32 h-32" }
    const positionMap = {
      "top-left": "top-4 left-4",
      "top-right": "top-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "bottom-right": "bottom-4 right-4",
      center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    }

    return {
      size: sizeMap[gestureSize as keyof typeof sizeMap],
      position: positionMap[gesturePosition as keyof typeof positionMap],
      opacity: gestureOpacity / 100,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          <span className="text-xl">Loading NFT...</span>
        </div>
      </div>
    )
  }

  if (!nft || !collection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">NFT Not Found</h1>
          <Button onClick={() => router.push("/gallery")} className="bg-yellow-500 text-black">
            Back to Gallery
          </Button>
        </div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <Button onClick={() => router.back()} variant="ghost" className="mb-8 text-yellow-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>

          <div className="text-center max-w-md mx-auto">
            <Palette className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
            <h1 className="text-3xl font-bold mb-4">Connect Wallet Required</h1>
            <p className="text-gray-400 mb-8">
              You need to connect your wallet to use the gesture builder and verify NFT ownership.
            </p>
            <Button
              onClick={connectWallet}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-3"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <Button onClick={() => router.back()} variant="ghost" className="mb-8 text-yellow-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>

          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-4">You can only add gestures to NFTs that you own.</p>
            <p className="text-sm text-gray-500 mb-8">
              This NFT is owned by: <span className="font-mono text-yellow-500">{nft.owner}</span>
            </p>
            <Button onClick={() => router.push("/gallery")} className="bg-yellow-500 text-black">
              Browse Gallery
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => router.back()} variant="ghost" className="text-yellow-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
          <h1 className="text-3xl font-bold">
            <span className={`bg-gradient-to-r ${getThemeColors(collection.theme)} bg-clip-text text-transparent`}>
              Gesture Builder
            </span>
          </h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* NFT Info */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
          <div className="flex items-center gap-4">
            <Badge className={`bg-gradient-to-r ${getThemeColors(collection.theme)} text-black`}>
              {collection.name}
            </Badge>
            <h2 className="text-xl font-bold">{nft.name}</h2>
            <Badge variant="secondary" className="bg-green-900 text-green-300">
              ✓ You Own This NFT
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* NFT Preview with Gesture */}
          <div>
            <h3 className="text-xl font-bold mb-6">Preview</h3>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden mb-6">
                  <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
                  {/* Gesture Overlay */}
                  {selectedGesture && (
                    <div
                      className={`absolute ${getGestureStyles().position} ${getGestureStyles().size} pointer-events-none`}
                      style={{ opacity: getGestureStyles().opacity }}
                    >
                      <img
                        src={selectedGesture || "/placeholder.svg"}
                        alt="Gesture overlay"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h4 className="font-bold text-lg mb-2">{nft.name}</h4>
                  <p className="text-gray-400 text-sm">{nft.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gesture Controls */}
          <div>
            <h3 className="text-xl font-bold mb-6">Customize Gesture</h3>

            {/* Gesture Selection */}
            <div className="mb-8">
              <h4 className="font-semibold mb-4">Choose Gesture</h4>
              <div className="grid grid-cols-3 gap-4">
                {gestures.map((gesture) => (
                  <Button
                    key={gesture.name}
                    onClick={() => setSelectedGesture(gesture.file)}
                    variant={selectedGesture === gesture.file ? "default" : "outline"}
                    className={`h-20 flex flex-col items-center justify-center ${
                      selectedGesture === gesture.file
                        ? `bg-gradient-to-r ${getThemeColors(collection.theme)} text-black`
                        : "border-gray-700 hover:border-yellow-500 bg-transparent"
                    }`}
                  >
                    <span className="text-2xl mb-1">{gesture.icon}</span>
                    <span className="text-xs">{gesture.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Gesture Settings */}
            {selectedGesture && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                  <Select value={gesturePosition} onValueChange={setGesturePosition}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Size</label>
                  <Select value={gestureSize} onValueChange={setGestureSize}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Opacity: {gestureOpacity}%</label>
                  <Input
                    type="range"
                    min="10"
                    max="100"
                    value={gestureOpacity}
                    onChange={(e) => setGestureOpacity(Number.parseInt(e.target.value))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button className={`flex-1 bg-gradient-to-r ${getThemeColors(collection.theme)} text-black`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on Social
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
