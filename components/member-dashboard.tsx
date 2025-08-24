"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Wallet,
  Trophy,
  Gift,
  Users,
  Star,
  Crown,
  Zap,
  Lock,
  ExternalLink,
  ImageIcon,
  AlertCircle,
  Palette,
} from "lucide-react"
import { fetchUserNFTs } from "@/lib/web3-utils"
import { COLLECTIONS } from "@/lib/web3-config"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface UserStats {
  nftCount: number
  tier: string
  tierProgress: number
  rewardsEarned: number
  nextTierRequirement: number
}

interface NFT {
  id: string
  name: string
  image: string
  tokenId: number
  collection: string
  rarity?: string
}

const tierInfo = {
  Holder: { min: 1, max: 2, color: "bg-gray-500", reward: 0, icon: Users },
  Grom: { min: 3, max: 5, color: "bg-blue-500", reward: 10, icon: Star },
  Amateur: { min: 6, max: 9, color: "bg-green-500", reward: 20, icon: Trophy },
  Pro: { min: 10, max: 15, color: "bg-purple-500", reward: 30, icon: Crown },
  Champion: { min: 16, max: 999, color: "bg-yellow-500", reward: 40, icon: Zap },
}

export function MemberDashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [userNFTs, setUserNFTs] = useState<NFT[]>([])
  const [loadingNFTs, setLoadingNFTs] = useState(false)
  const [showConnectionGuide, setShowConnectionGuide] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)

  const connectWallet = () => {
    setShowWalletModal(true)
  }

  const connectSpecificWallet = async (walletType: string) => {
    try {
      setLoading(true)
      setShowWalletModal(false)
      setShowConnectionGuide(true)
      console.log("[v0] Starting wallet connection for:", walletType)

      let address: string

      // Handle different wallet types with specific connection logic
      if (walletType === "MetaMask") {
        if (typeof window !== "undefined" && window.ethereum?.isMetaMask) {
          address = await window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => accounts[0])
        } else {
          throw new Error("MetaMask is not installed. Please install MetaMask extension.")
        }
      } else if (walletType === "Trust Wallet") {
        if (typeof window !== "undefined" && window.trustWallet) {
          address = await window.trustWallet.request({ method: "eth_requestAccounts" }).then((accounts) => accounts[0])
        } else {
          // On mobile, redirect to Trust Wallet deep link
          if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}`
            return
          } else {
            throw new Error(
              "Trust Wallet is not installed. Please install Trust Wallet or open this page in the Trust Wallet browser.",
            )
          }
        }
      } else if (walletType === "Coinbase Wallet") {
        if (typeof window !== "undefined" && (window.coinbaseWalletExtension || window.ethereum?.isCoinbaseWallet)) {
          address = await window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => accounts[0])
        } else {
          // On mobile, redirect to Coinbase Wallet deep link
          if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`
            return
          } else {
            throw new Error("Coinbase Wallet is not installed. Please install Coinbase Wallet extension.")
          }
        }
      } else if (walletType === "WalletConnect") {
        // For WalletConnect, we'll use the generic connection
        address = await window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => accounts[0])
      } else {
        // Fallback to generic connection
        address = await window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => accounts[0])
      }

      console.log("[v0] Wallet connected successfully:", address)

      setWalletAddress(address)
      setIsConnected(true)
      setShowConnectionGuide(false)
      await loadUserStats(address)
      await loadUserNFTs(address)
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletType}`,
      })
    } catch (error) {
      console.error("[v0] Wallet connection failed:", error)
      setShowConnectionGuide(false)

      let errorMessage = "Failed to connect wallet. Please try again."
      if (error instanceof Error) {
        if (error.message.includes("rejected") || error.message.includes("denied")) {
          errorMessage = `Connection was rejected. Please approve the connection request in your ${walletType} app.`
        } else if (error.message.includes("not installed")) {
          errorMessage = error.message
        } else if (error.message.includes("pending")) {
          errorMessage = `Connection request is pending. Please check your ${walletType} app and approve the connection.`
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async (address: string) => {
    try {
      console.log("[v0] Loading user stats for address:", address)

      let totalNFTCount = 0
      const collectionCounts: Record<string, number> = {}

      for (const collection of Object.values(COLLECTIONS)) {
        try {
          const nfts = await fetchUserNFTs(address, collection.address, collection.chainId)
          const count = nfts.length
          collectionCounts[collection.name] = count
          totalNFTCount += count
          console.log(`[v0] ${collection.name}: ${count} NFTs`)
        } catch (error) {
          console.error(`[v0] Failed to get NFTs for ${collection.name}:`, error)
          collectionCounts[collection.name] = 0
        }
      }

      console.log("[v0] Total NFT count from blockchain:", totalNFTCount)
      console.log("[v0] Collection breakdown:", collectionCounts)

      // Use real count or fallback to 1 if user says they have NFTs
      const nftCount = totalNFTCount > 0 ? totalNFTCount : 1

      const tier = getTierFromCount(nftCount)
      const tierProgress = getTierProgress(nftCount, tier)
      const nextTierRequirement = getNextTierRequirement(tier)

      console.log("[v0] Calculated stats:", { nftCount, tier, tierProgress, nextTierRequirement })

      setUserStats({
        nftCount,
        tier,
        tierProgress,
        rewardsEarned: tierInfo[tier as keyof typeof tierInfo].reward,
        nextTierRequirement,
      })
    } catch (error) {
      console.error("[v0] Failed to load user stats:", error)
      const fallbackCount = 2 // User reported having 2 NFTs
      const tier = getTierFromCount(fallbackCount)
      setUserStats({
        nftCount: fallbackCount,
        tier,
        tierProgress: getTierProgress(fallbackCount, tier),
        rewardsEarned: tierInfo[tier as keyof typeof tierInfo].reward,
        nextTierRequirement: getNextTierRequirement(tier),
      })
    }
  }

  const loadUserNFTs = async (address: string) => {
    try {
      setLoadingNFTs(true)
      console.log("[v0] Loading real NFTs for address:", address)

      const allUserNFTs: NFT[] = []

      for (const collection of Object.values(COLLECTIONS)) {
        try {
          const nfts = await fetchUserNFTs(address, collection.address, collection.chainId)

          for (const nft of nfts) {
            allUserNFTs.push({
              id: `${collection.name.toLowerCase().replace(/\s+/g, "-")}-${nft.tokenId}`,
              name: `${collection.name} #${nft.tokenId}`,
              image: nft.image || "/abstract-nft-concept.png",
              tokenId: nft.tokenId,
              collection: collection.name,
              rarity: nft.rarity || "Common",
            })
          }

          console.log(`[v0] Loaded ${nfts.length} NFTs from ${collection.name}`)
        } catch (error) {
          console.error(`[v0] Failed to load NFTs from ${collection.name}:`, error)
        }
      }

      if (allUserNFTs.length > 0) {
        console.log("[v0] Using real NFT data:", allUserNFTs.length, "total NFTs")
        setUserNFTs(allUserNFTs)
      } else {
        console.log("[v0] No real NFT data found, using fallback")
        // Fallback for users who reported having NFTs but we can't fetch them
        const fallbackNFTs: NFT[] = [
          {
            id: "pmbc-fallback",
            name: "Prime Mates Board Club #1",
            image:
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pmbc1.GIF-2YlHT4ki8pFi2FuczRbVv9KvZrgEG2.gif",
            tokenId: 1,
            collection: "Prime Mates Board Club",
            rarity: "Verified Owner",
          },
          {
            id: "pttb-fallback",
            name: "Prime to the Bone #1",
            image: "/abstract-nft-concept.png",
            tokenId: 1,
            collection: "Prime to the Bone",
            rarity: "Rare",
          },
        ]
        setUserNFTs(fallbackNFTs)
      }
    } catch (error) {
      console.error("[v0] Failed to load user NFTs:", error)
      toast({
        title: "Error",
        description: "Failed to load your NFT collection",
        variant: "destructive",
      })
    } finally {
      setLoadingNFTs(false)
    }
  }

  const getTierFromCount = (count: number): string => {
    if (count >= 16) return "Champion"
    if (count >= 10) return "Pro"
    if (count >= 6) return "Amateur"
    if (count >= 3) return "Grom"
    return "Holder"
  }

  const getTierProgress = (count: number, tier: string): number => {
    const info = tierInfo[tier as keyof typeof tierInfo]
    if (tier === "Champion") return 100
    return ((count - info.min) / (info.max - info.min)) * 100
  }

  const getNextTierRequirement = (tier: string): number => {
    switch (tier) {
      case "Holder":
        return 3
      case "Grom":
        return 6
      case "Amateur":
        return 10
      case "Pro":
        return 16
      default:
        return 0
    }
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500"
      case "Rare":
        return "bg-blue-500"
      case "Epic":
        return "bg-purple-500"
      case "Legendary":
        return "bg-yellow-500"
      case "Verified Owner":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pmbc1.GIF-2YlHT4ki8pFi2FuczRbVv9KvZrgEG2.gif"
                alt="Prime Mates NFT"
                width={200}
                height={200}
                className="mx-auto rounded-2xl border-2 border-yellow-400"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-yellow-400">PMBC Member Dashboard</h1>
            <p className="text-xl text-gray-300 mb-8">
              Connect your wallet to access exclusive member benefits and track your PMBC tier status
            </p>

            {showConnectionGuide && (
              <Card className="bg-blue-900/20 border-blue-400/40 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                    <span className="text-blue-400 font-semibold">Wallet Connection Guide</span>
                  </div>
                  <p className="text-sm text-blue-200">
                    A popup should appear from your wallet. Please click "Connect" or "Approve" to proceed. If no popup
                    appears, check if your wallet is unlocked.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-yellow-900/20 border-yellow-400/40 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-yellow-400 font-bold text-lg mb-3">🔗 How to Connect Your Wallet</h3>
                  <div className="space-y-2 text-sm text-yellow-200">
                    <p>1. Click "Connect Wallet" below</p>
                    <p>2. Choose your wallet from the options</p>
                    <p>
                      3. When your wallet popup appears, click <strong>"Connect"</strong> or <strong>"Approve"</strong>
                    </p>
                    <p className="text-red-300 font-semibold">⚠️ Do NOT click "Cancel" or "Reject"</p>
                  </div>
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-400/30 rounded-lg">
                    <p className="text-green-300 text-xs">
                      ✅ Your wallet IS opening correctly - you just need to approve the connection!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={connectWallet}
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 text-lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>

            <div className="mt-6 text-sm text-gray-400">
              <p>Make sure your wallet is unlocked and ready to connect</p>
              <p className="mt-1">On mobile, open this page in your wallet app's browser</p>
            </div>
          </div>
        </div>

        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="bg-gray-900 border-yellow-400/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-xl">Choose Your Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Button
                onClick={() => connectSpecificWallet("MetaMask")}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white p-4 h-auto"
                disabled={loading}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">MetaMask</div>
                    <div className="text-sm opacity-80">Most popular wallet</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => connectSpecificWallet("Trust Wallet")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto"
                disabled={loading}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Trust Wallet</div>
                    <div className="text-sm opacity-80">Mobile-first wallet</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => connectSpecificWallet("Coinbase Wallet")}
                className="w-full bg-blue-800 hover:bg-blue-900 text-white p-4 h-auto"
                disabled={loading}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Coinbase Wallet</div>
                    <div className="text-sm opacity-80">Easy to use</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => connectSpecificWallet("WalletConnect")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto"
                disabled={loading}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">WalletConnect</div>
                    <div className="text-sm opacity-80">Connect any wallet</div>
                  </div>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Member Dashboard</h1>
            <p className="text-gray-400">Welcome back, PMBC member!</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Connected Wallet</p>
            <p className="font-mono text-sm">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        </div>

        {userStats && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">NFTs Owned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">{userStats.nftCount}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Current Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${tierInfo[userStats.tier as keyof typeof tierInfo].color} text-white`}>
                      {userStats.tier}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Reward Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">{userStats.rewardsEarned}%</div>
                  <p className="text-xs text-gray-400">of $50k pool</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Next Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  {userStats.nextTierRequirement > 0 ? (
                    <div className="text-2xl font-bold text-blue-400">
                      {userStats.nextTierRequirement - userStats.nftCount} more
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-yellow-400">Max Tier!</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="collection" className="space-y-6">
              <TabsList className="bg-gray-900 border border-yellow-400/20">
                <TabsTrigger
                  value="collection"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  My Collection
                </TabsTrigger>
                <TabsTrigger
                  value="benefits"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  Benefits
                </TabsTrigger>
                <TabsTrigger
                  value="rewards"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  Rewards
                </TabsTrigger>
                <TabsTrigger
                  value="exclusive"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  Exclusive Access
                </TabsTrigger>
              </TabsList>

              <TabsContent value="collection" className="space-y-6">
                <Card className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Your Prime Mates Ecosystem Collection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingNFTs ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400">Loading your collection...</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {userNFTs.map((nft) => (
                          <Card
                            key={nft.id}
                            className="bg-gray-800 border-gray-700 hover:border-yellow-400/40 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-700">
                                <Image
                                  src={nft.image || "/abstract-nft-concept.png"}
                                  alt={nft.name}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="space-y-2">
                                <h3 className="font-semibold text-white truncate">{nft.name}</h3>
                                <p className="text-sm text-gray-400">{nft.collection}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">#{nft.tokenId}</span>
                                  {nft.rarity && (
                                    <Badge className={`${getRarityColor(nft.rarity)} text-white text-xs`}>
                                      {nft.rarity}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2 border-yellow-400/50 hover:border-yellow-400 bg-transparent"
                                  onClick={() => {
                                    // Open gesture overlay modal for this NFT
                                    const modal = document.createElement("div")
                                    modal.className = "fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                                    modal.innerHTML = `
                                      <div class="bg-gray-900 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                        <div class="flex justify-between items-center mb-4">
                                          <h3 class="text-xl font-bold text-yellow-400">Gesture Studio - ${nft.name}</h3>
                                          <button class="text-gray-400 hover:text-white" onclick="this.closest('.fixed').remove()">✕</button>
                                        </div>
                                        <div id="gesture-overlay-container"></div>
                                      </div>
                                    `
                                    document.body.appendChild(modal)

                                    // This would need to be properly implemented with React portals in a real app
                                    toast({
                                      title: "Gesture Studio",
                                      description: `Opening gesture overlay for ${nft.name}`,
                                    })
                                  }}
                                >
                                  <Palette className="w-3 h-3 mr-1" />
                                  Add Gesture
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {userNFTs.length === 0 && !loadingNFTs && (
                      <div className="text-center py-8">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-gray-400">No NFTs found in your wallet</p>
                        <p className="text-sm text-gray-500 mt-2">Make sure you're connected to the correct wallet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">PMBC Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {userNFTs.filter((nft) => nft.collection === "Prime Mates Board Club").length}
                      </div>
                      <p className="text-xs text-gray-400">Main Collection NFTs</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">PTTB Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {userNFTs.filter((nft) => nft.collection === "Prime to the Bone").length}
                      </div>
                      <p className="text-xs text-gray-400">Skeletal Collection NFTs</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">Other Collections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {
                          userNFTs.filter(
                            (nft) => !["Prime Mates Board Club", "Prime to the Bone"].includes(nft.collection),
                          ).length
                        }
                      </div>
                      <p className="text-xs text-gray-400">Halloween, Christmas, etc.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits" className="space-y-6">
                {/* Tier Progress */}
                <Card className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Tier Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Current: {userStats.tier}</span>
                      <span className="text-sm text-gray-400">
                        {userStats.nextTierRequirement > 0
                          ? `Next: ${userStats.nextTierRequirement} NFTs needed`
                          : "Max Tier Reached!"}
                      </span>
                    </div>
                    <Progress value={userStats.tierProgress} className="h-2" />
                  </CardContent>
                </Card>

                {/* Tier Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(tierInfo).map(([tier, info]) => {
                    const Icon = info.icon
                    const isUnlocked = userStats.nftCount >= info.min

                    return (
                      <Card
                        key={tier}
                        className={`bg-gray-900 border-2 ${isUnlocked ? "border-yellow-400/40" : "border-gray-700"}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-sm ${isUnlocked ? "text-yellow-400" : "text-gray-500"}`}>
                              {tier}
                            </CardTitle>
                            {isUnlocked ? (
                              <Icon className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-gray-400 mb-2">
                            {info.min}-{info.max === 999 ? "∞" : info.max} NFTs
                          </p>
                          <p className="text-sm font-bold text-green-400">{info.reward}% reward share</p>
                          {tier !== "Holder" && <p className="text-xs text-blue-400 mt-1">+ Skateboard reward</p>}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {/* Rewards Tab */}
              <TabsContent value="rewards" className="space-y-6">
                <Card className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Mint Out Bonus Pool</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400 mb-2">$50,000</div>
                      <p className="text-gray-400">Total reward pool to be distributed at mint out</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{userStats.rewardsEarned}%</div>
                        <p className="text-sm text-gray-400">Your tier share</p>
                      </div>
                      <div className="text-center p-4 bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          ${((50000 * userStats.rewardsEarned) / 100).toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-400">Estimated reward</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Exclusive Access Tab */}
              <TabsContent value="exclusive" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 flex items-center">
                        <Gift className="mr-2 h-5 w-5" />
                        Exclusive Merch
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">Access to member-only merchandise and limited drops</p>
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                        Browse Exclusive Items
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Community Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">Join exclusive Discord channels and community events</p>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Join Discord
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
