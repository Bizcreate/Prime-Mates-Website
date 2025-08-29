"use client"

import { useState, useEffect } from "react"
import { useActiveAccount, useDisconnect } from "thirdweb/react"
import { fetchUserNFTs } from "@/lib/web3-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Gift, Users, Star, Crown, Zap, Lock, ExternalLink, ImageIcon, Palette } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface UserStats {
  nftCount: number
  tier: string
  tierProgress: number
  rewardsEarned: number
  nextTierRequirement: number
}

interface NFT {
  collection: string
  metadata: {
    id: string
    name?: string
    image?: string
  }
}

interface Collections {
  pmbc: NFT[]
  pttb: NFT[]
  halloween: NFT[]
  christmas: NFT[]
}

const tierInfo = {
  Holder: { min: 1, max: 2, color: "bg-gray-500", reward: 0, icon: Users },
  Grom: { min: 3, max: 5, color: "bg-blue-500", reward: 10, icon: Star },
  Amateur: { min: 6, max: 9, color: "bg-green-500", reward: 20, icon: Trophy },
  Pro: { min: 10, max: 15, color: "bg-purple-500", reward: 30, icon: Crown },
  Champion: { min: 16, max: 999, color: "bg-yellow-500", reward: 40, icon: Zap },
}

export function MemberDashboard() {
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  const address = account?.address
  const isConnected = !!account

  const [nfts, setNfts] = useState<NFT[]>([])
  const [collections, setCollections] = useState<Collections>({ pmbc: [], pttb: [], halloween: [], christmas: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (isConnected && address) {
      console.log("[v0] Thirdweb wallet connected, fetching NFTs for:", address)
      loadUserNFTs()
    }
  }, [isConnected, address])

  const loadUserNFTs = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      console.log("[v0] Fetching NFTs for address:", address)
      const userNFTs = await fetchUserNFTs(address)
      console.log("[v0] Fetched NFTs:", userNFTs)

      setNfts(userNFTs)

      // Group by collections
      const groupedCollections: Collections = {
        pmbc: userNFTs.filter((nft) => nft.collection === "Prime Mates Board Club"),
        pttb: userNFTs.filter((nft) => nft.collection === "Prime To The Bone"),
        halloween: userNFTs.filter((nft) => nft.collection === "Prime Halloween"),
        christmas: userNFTs.filter((nft) => nft.collection === "Prime Mates Christmas Club"),
      }

      setCollections(groupedCollections)
      calculateUserStats(userNFTs.length)

      if (userNFTs.length > 0) {
        toast.success(`Found ${userNFTs.length} Prime Mates NFTs in your wallet!`)
      } else {
        toast.info("No Prime Mates NFTs found in this wallet")
      }
    } catch (error) {
      console.error("[v0] Error fetching NFTs:", error)
      toast.error("Failed to load NFTs")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateUserStats = (nftCount: number) => {
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

            <Card className="bg-yellow-900/20 border-yellow-400/40 mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-yellow-400 font-bold text-lg mb-3">🔗 Connect Your Wallet</h3>
                  <div className="space-y-2 text-sm text-yellow-200">
                    <p>Click the button below to connect your wallet</p>
                    <p>We'll automatically detect your Prime Mates NFTs</p>
                    <p className="text-green-300 font-semibold">✅ Supports MetaMask and other Web3 wallets</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <div className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 text-lg rounded-lg">
                {/* This will be handled by the thirdweb ConnectButton in the navigation */}
                <p>Use the Connect Wallet button in the navigation</p>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-400">
              <p>Secure wallet connection via Web3</p>
              <p className="mt-1">Your wallet address: {address || "Not connected"}</p>
            </div>
          </div>
        </div>
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
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>

        {isLoading && (
          <Card className="bg-gray-900 border-yellow-400/20 mb-8">
            <CardContent className="p-6 text-center">
              <div className="text-yellow-400">Loading your NFT collection...</div>
              <p className="text-sm text-gray-400 mt-2">Scanning blockchain for your Prime Mates NFTs</p>
            </CardContent>
          </Card>
        )}

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
                  <p className="text-xs text-gray-500 mt-1">
                    {userStats.nftCount === 0 ? "No NFTs found in connected wallet" : "Verified on blockchain"}
                  </p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {nfts.map((nft) => (
                        <Card
                          key={`${nft.collection}-${nft.metadata.id}`}
                          className="bg-gray-800 border-gray-700 hover:border-yellow-400/40 transition-colors"
                        >
                          <CardContent className="p-4">
                            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-700">
                              <Image
                                src={nft.metadata.image || "/abstract-nft-concept.png"}
                                alt={nft.metadata.name || `Token #${nft.metadata.id}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-semibold text-white truncate">
                                {nft.metadata.name || `Token #${nft.metadata.id}`}
                              </h3>
                              <p className="text-sm text-gray-400">{nft.collection}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">#{nft.metadata.id}</span>
                                <Badge className="bg-green-500 text-white text-xs">Verified Owner</Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-2 border-yellow-400/50 hover:border-yellow-400 bg-transparent"
                                onClick={() => {
                                  window.open(`/gesture/${nft.collection}/${nft.metadata.id}`, "_blank")
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

                    {nfts.length === 0 && !isLoading && (
                      <div className="text-center py-8">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-gray-400">No Prime Mates NFTs found in your wallet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                        <p className="text-sm text-blue-400 mt-2">
                          Make sure you're connected to the wallet that holds your Prime Mates NFTs
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">PMBC Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{collections.pmbc.length}</div>
                      <p className="text-xs text-gray-400">Main Collection NFTs</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">PTTB Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{collections.pttb.length}</div>
                      <p className="text-xs text-gray-400">Skeletal Collection NFTs</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">Halloween Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{collections.halloween.length}</div>
                      <p className="text-xs text-gray-400">Halloween NFTs</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">Christmas Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{collections.christmas.length}</div>
                      <p className="text-xs text-gray-400">Christmas NFTs</p>
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
