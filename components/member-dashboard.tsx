"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Trophy, Gift, Users, Star, Crown, Zap, Lock, ExternalLink } from "lucide-react"
import { web3Service } from "@/lib/web3"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface UserStats {
  nftCount: number
  tier: string
  tierProgress: number
  rewardsEarned: number
  nextTierRequirement: number
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

  const connectWallet = async () => {
    try {
      setLoading(true)
      console.log("[v0] Starting wallet connection...")

      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      console.log("[v0] MetaMask detected, calling web3Service.connectWallet...")
      const address = await web3Service.connectWallet()
      console.log("[v0] Wallet connected successfully:", address)

      setWalletAddress(address)
      setIsConnected(true)
      await loadUserStats(address)
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      })
    } catch (error) {
      console.error("[v0] Wallet connection failed:", error)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async (address: string) => {
    try {
      const nftCount = Math.floor(Math.random() * 20) + 1 // Simulate 1-20 NFTs

      const tier = getTierFromCount(nftCount)
      const tierProgress = getTierProgress(nftCount, tier)
      const nextTierRequirement = getNextTierRequirement(tier)

      setUserStats({
        nftCount,
        tier,
        tierProgress,
        rewardsEarned: tierInfo[tier as keyof typeof tierInfo].reward,
        nextTierRequirement,
      })
    } catch (error) {
      console.error("Failed to load user stats:", error)
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
            <Button
              onClick={connectWallet}
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 text-lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
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

            <Tabs defaultValue="benefits" className="space-y-6">
              <TabsList className="bg-gray-900 border border-yellow-400/20">
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
