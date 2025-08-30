"use client"

import { useState, useEffect } from "react"
import { useActiveAccount, useDisconnect } from "thirdweb/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Users,
  Star,
  Crown,
  Zap,
  Lock,
  ImageIcon,
  Palette,
  Coins,
  Clock,
  TrendingUp,
  Package,
  Gift,
  ShoppingBag,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMultiWallet } from "@/contexts/multi-wallet-context"
import { MultiWalletManager } from "@/components/multi-wallet-manager"
import Image from "next/image"
import { useTokens } from "@/contexts/token-context"
import { TokenManagement } from "@/components/token-management"

interface UserStats {
  nftCount: number
  tier: string
  tierProgress: number
  rewardsEarned: number
  nextTierRequirement: number
  collections: Collections
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

interface StakedNFT {
  id: string
  collection: "PMBC" | "PTTB"
  tokenId: string
  stakedAt: Date
  rewards: number
  multiplier: number
  image: string
  name: string
}

interface StakingStats {
  totalStaked: number
  totalRewards: number
  dailyRewards: number
  stakingPower: number
}

interface PurchaseItem {
  id: number
  item: string
  category: "merchandise" | "digital" | "exclusive"
  date: string
  status: "delivered" | "shipped" | "processing" | "cancelled"
  price: number
  currency: "USD" | "SHAKA" | "GRIND"
  image?: string
  trackingNumber?: string
  claimable?: boolean
}

interface ClaimableReward {
  id: number
  title: string
  description: string
  type: "nft" | "token" | "merchandise" | "access"
  value: number
  currency: "SHAKA" | "GRIND" | "USD"
  expiresAt?: Date
  requirements?: string
  image?: string
  claimed: boolean
}

interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  rarity: "common" | "rare" | "epic" | "legendary"
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

  const {
    wallets,
    primaryWallet,
    activeWallet,
    totalNFTs,
    isLoading: multiWalletLoading,
    getAggregatedNFTs,
    getTotalBalance,
    refreshAllWallets,
  } = useMultiWallet()

  const { shakaBalance, grindBalance } = useTokens()

  const [isLoading, setIsLoading] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [stakedNFTs, setStakedNFTs] = useState<StakedNFT[]>([])
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: 0,
    totalRewards: 0,
    dailyRewards: 0,
    stakingPower: 0,
  })
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseItem[]>([])
  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [inventoryFilter, setInventoryFilter] = useState<"all" | "merchandise" | "digital" | "exclusive">("all")
  const [nfts, setNfts] = useState<NFT[]>([]) // Declare setNfts
  const [collections, setCollections] = useState<Collections>({ pmbc: [], pttb: [], halloween: [], christmas: [] }) // Declare setCollections
  const { toast: hookToast } = useToast()

  const setWalletBalance = (balance: string) => {
    // Declare setWalletBalance
    // Implementation can be added here if needed
  }

  useEffect(() => {
    if (wallets.length > 0) {
      console.log("[v0] Multi-wallet system active, calculating stats for", wallets.length, "wallets")
      loadStakingData()
      loadUserProfile()
      calculateAggregatedStats()
    }
  }, [wallets, totalNFTs])

  const calculateAggregatedStats = () => {
    const aggregatedNFTs = getAggregatedNFTs()
    const totalNFTCount = aggregatedNFTs.length

    const collections = {
      pmbc: aggregatedNFTs.filter((nft) => nft.collection === "Prime Mates Board Club"),
      pttb: aggregatedNFTs.filter((nft) => nft.collection === "Prime To The Bone"),
      halloween: aggregatedNFTs.filter((nft) => nft.collection === "Prime Halloween"),
      christmas: aggregatedNFTs.filter((nft) => nft.collection === "Prime Mates Christmas Club"),
    }

    calculateUserStats(totalNFTCount, collections)

    if (totalNFTCount > 0) {
      hookToast({
        title: "Portfolio Loaded",
        description: `Found ${totalNFTCount} Prime Mates NFTs across ${wallets.length} wallet(s)!`,
      })
    }
  }

  const loadUserNFTs = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      console.log("[v0] Fetching NFTs for address:", address)
      // Placeholder since multi-wallet system handles this
      const userNFTs: NFT[] = []
      console.log("[v0] Using multi-wallet system for NFT data")

      setNfts(userNFTs)

      const groupedCollections: Collections = {
        pmbc: userNFTs.filter((nft) => nft.collection === "Prime Mates Board Club"),
        pttb: userNFTs.filter((nft) => nft.collection === "Prime To The Bone"),
        halloween: userNFTs.filter((nft) => nft.collection === "Prime Halloween"),
        christmas: userNFTs.filter((nft) => nft.collection === "Prime Mates Christmas Club"),
      }

      setCollections(groupedCollections)
      calculateUserStats(userNFTs.length, groupedCollections)

      if (userNFTs.length > 0) {
        hookToast({
          title: "NFTs Found",
          description: `Found ${userNFTs.length} Prime Mates NFTs in your wallet!`,
        })
      } else {
        hookToast({
          title: "No NFTs Found",
          description: "No Prime Mates NFTs found in this wallet",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching NFTs:", error)
      hookToast({
        title: "Failed to Load NFTs",
        description: "Failed to load NFTs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStakingData = async () => {
    try {
      console.log("[v0] Loading staking data for", wallets.length, "wallets")

      const mockStakedNFTs: StakedNFT[] = [
        {
          id: "1",
          collection: "PMBC",
          tokenId: "1234",
          stakedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          rewards: 125.5,
          multiplier: 1.2,
          image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pmbc1.GIF-2YlHT4ki8pFi2FuczRbVv9KvZrgEG2.gif",
          name: "Prime Mate #1234",
        },
      ]

      setStakedNFTs(mockStakedNFTs)

      const totalRewards = mockStakedNFTs.reduce((sum, nft) => sum + nft.rewards, 0)
      const dailyRewards = mockStakedNFTs.length * 5.5

      setStakingStats({
        totalStaked: mockStakedNFTs.length,
        totalRewards,
        dailyRewards,
        stakingPower: mockStakedNFTs.reduce((sum, nft) => sum + nft.multiplier, 0),
      })
    } catch (error) {
      console.error("Error loading staking data:", error)
    }
  }

  const loadUserProfile = async () => {
    try {
      setPurchaseHistory([
        {
          id: 1,
          item: "Prime Hoodie - Black",
          category: "merchandise",
          date: "2024-01-15",
          status: "delivered",
          price: 65,
          currency: "USD",
          image: "/black-hoodie.png",
          trackingNumber: "1Z999AA1234567890",
        },
        {
          id: 2,
          item: "PMBC Sticker Pack",
          category: "merchandise",
          date: "2024-01-10",
          status: "shipped",
          price: 15,
          currency: "USD",
          image: "/sticker-pack.png",
          trackingNumber: "1Z999AA1234567891",
        },
        {
          id: 3,
          item: "Exclusive Discord Role",
          category: "digital",
          date: "2024-01-05",
          status: "delivered",
          price: 500,
          currency: "SHAKA",
          image: "/discord-badge.png",
        },
        {
          id: 4,
          item: "Prime Skateboard Deck",
          category: "exclusive",
          date: "2024-01-20",
          status: "processing",
          price: 1200,
          currency: "GRIND",
          image: "/skateboard-deck.png",
        },
      ])

      setClaimableRewards([
        {
          id: 1,
          title: "Weekly Staking Bonus",
          description: "Bonus tokens for consistent staking",
          type: "token",
          value: 250,
          currency: "SHAKA",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          requirements: "Stake NFTs for 7 consecutive days",
          image: "/token-reward.png",
          claimed: false,
        },
        {
          id: 2,
          title: "Tier Upgrade Reward",
          description: "Congratulations on reaching Grom tier!",
          type: "merchandise",
          value: 1,
          currency: "USD",
          requirements: "Reach Grom tier",
          image: "/tier-badge.png",
          claimed: false,
        },
        {
          id: 3,
          title: "Community Event NFT",
          description: "Limited edition community event commemorative NFT",
          type: "nft",
          value: 1,
          currency: "USD",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          requirements: "Participate in community events",
          image: "/commemorative-nft.png",
          claimed: false,
        },
      ])

      setAchievements([
        {
          id: 1,
          title: "First Steps",
          description: "Connected your first wallet",
          icon: "🚀",
          unlockedAt: new Date("2024-01-01"),
          rarity: "common",
        },
        {
          id: 2,
          title: "NFT Collector",
          description: "Own 5 or more Prime Mates NFTs",
          icon: "🖼️",
          progress: totalNFTs,
          maxProgress: 5,
          rarity: "rare",
        },
        {
          id: 3,
          title: "Staking Master",
          description: "Stake NFTs for 30 consecutive days",
          icon: "⚡",
          progress: 7,
          maxProgress: 30,
          rarity: "epic",
        },
        {
          id: 4,
          title: "Community Champion",
          description: "Reach Champion tier",
          icon: "👑",
          progress: totalNFTs,
          maxProgress: 16,
          rarity: "legendary",
        },
      ])
    } catch (error) {
      hookToast({
        title: "Failed to Load Profile",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    }
  }

  const claimReward = async (rewardId: number) => {
    try {
      setIsLoading(true)
      console.log("[v0] Claiming reward:", rewardId)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      setClaimableRewards((prev) =>
        prev.map((reward) => (reward.id === rewardId ? { ...reward, claimed: true } : reward)),
      )

      hookToast({
        title: "Reward Claimed",
        description: "Successfully claimed your reward!",
      })
    } catch (error) {
      hookToast({
        title: "Claim Failed",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "shipped":
        return <Package className="w-4 h-4 text-blue-500" />
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const stakeNFT = async (nft: any) => {
    try {
      setIsLoading(true)
      console.log("[v0] Staking NFT:", nft.metadata.name)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      hookToast({
        title: "NFT Staked",
        description: `Successfully staked ${nft.metadata.name}`,
      })

      await loadStakingData()
    } catch (error) {
      hookToast({
        title: "Staking Failed",
        description: "Failed to stake NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const unstakeNFT = async (nft: StakedNFT) => {
    try {
      setIsLoading(true)
      console.log("[v0] Unstaking NFT:", nft.name)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      hookToast({
        title: "NFT Unstaked",
        description: `Successfully unstaked ${nft.name}`,
      })

      await loadStakingData()
    } catch (error) {
      hookToast({
        title: "Unstaking Failed",
        description: "Failed to unstake NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const claimRewards = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Claiming rewards:", stakingStats.totalRewards)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      hookToast({
        title: "Rewards Claimed",
        description: `Successfully claimed ${stakingStats.totalRewards.toFixed(2)} PMBC tokens`,
      })

      await loadStakingData()
    } catch (error) {
      hookToast({
        title: "Claim Failed",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateUserStats = (nftCount: number, collections: Collections) => {
    const tier = getTierFromCount(nftCount)
    const tierProgress = getTierProgress(nftCount, tier)
    const nextTierRequirement = getNextTierRequirement(tier)

    console.log("[v0] Calculated aggregated stats:", { nftCount, tier, tierProgress, nextTierRequirement })

    setUserStats({
      nftCount,
      tier,
      tierProgress,
      rewardsEarned: tierInfo[tier as keyof typeof tierInfo].reward,
      nextTierRequirement,
      collections,
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

  const getDaysStaked = (stakedAt: Date) => {
    return Math.floor((Date.now() - stakedAt.getTime()) / (1000 * 60 * 60 * 24))
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Member Dashboard</h1>
            <p className="text-gray-400">Welcome back, PMBC member!</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Portfolio Overview</p>
            <p className="font-mono text-sm">
              {wallets.length} wallet{wallets.length !== 1 ? "s" : ""} connected
            </p>
            <p className="text-sm text-green-400">{getTotalBalance()} ETH total</p>
          </div>
        </div>

        {(isLoading || multiWalletLoading) && (
          <Card className="bg-gray-900 border-yellow-400/20 mb-8">
            <CardContent className="p-6 text-center">
              <div className="text-yellow-400">Loading your NFT portfolio...</div>
              <p className="text-sm text-gray-400 mt-2">Scanning blockchain across all connected wallets</p>
            </CardContent>
          </Card>
        )}

        {userStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Total NFTs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">{totalNFTs}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Across {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
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
                  <CardTitle className="text-sm text-gray-400">Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{getTotalBalance()}</div>
                  <p className="text-xs text-gray-400">ETH</p>
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

              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">$SHAKA Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">{shakaBalance.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Coming Soon</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">$GRIND Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">{grindBalance.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Coming Soon</p>
                </CardContent>
              </Card>
            </div>

            {/* Claimable Rewards */}
            {stakingStats.totalRewards > 0 && (
              <Card className="bg-gradient-to-r from-yellow-400/10 to-green-400/10 border-yellow-400/30 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Claimable Rewards</h3>
                      <p className="text-3xl font-bold text-yellow-400">{stakingStats.totalRewards.toFixed(2)} PMBC</p>
                      <p className="text-gray-400 text-sm">≈ ${(stakingStats.totalRewards * 0.15).toFixed(2)} USD</p>
                    </div>
                    <Button
                      onClick={claimRewards}
                      disabled={isLoading}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3"
                    >
                      {isLoading ? "Claiming..." : "Claim Rewards"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="collection" className="space-y-6">
              <TabsList className="bg-gray-900 border border-yellow-400/20">
                <TabsTrigger
                  value="collection"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  Portfolio Overview
                </TabsTrigger>
                <TabsTrigger
                  value="staking"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  Staking ({stakingStats.totalStaked})
                </TabsTrigger>
                <TabsTrigger
                  value="tokens"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  Token Management
                </TabsTrigger>
                <TabsTrigger
                  value="wallets"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  Wallets ({wallets.length})
                </TabsTrigger>
                <TabsTrigger
                  value="inventory"
                  className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                >
                  Inventory
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
              </TabsList>

              <TabsContent value="collection" className="space-y-6">
                <Card className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center justify-between">
                      <span className="flex items-center">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Prime Mates Portfolio ({totalNFTs} NFTs)
                      </span>
                      <Button
                        onClick={refreshAllWallets}
                        disabled={multiWalletLoading}
                        variant="outline"
                        size="sm"
                        className="border-yellow-400/50 bg-transparent"
                      >
                        Refresh Portfolio
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {getAggregatedNFTs().map((nft, index) => (
                        <Card
                          key={`${nft.collection}-${nft.metadata.id}-${index}`}
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

                    {totalNFTs === 0 && !multiWalletLoading && (
                      <div className="text-center py-8">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-gray-400">No Prime Mates NFTs found in your portfolio</p>
                        <p className="text-sm text-gray-500 mt-2">Connected wallets: {wallets.length}</p>
                        <p className="text-sm text-blue-400 mt-2">Add additional wallets to expand your portfolio</p>
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
                      <div className="text-2xl font-bold text-white">{userStats.collections?.pmbc?.length || 0}</div>
                      <p className="text-xs text-gray-400">Main Collection NFTs</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">PTTB Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{userStats.collections?.pttb?.length || 0}</div>
                      <p className="text-xs text-gray-400">Skeletal Collection NFTs</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">Halloween Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {userStats.collections?.halloween?.length || 0}
                      </div>
                      <p className="text-xs text-gray-400">Halloween NFTs</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-yellow-400/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">Christmas Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {userStats.collections?.christmas?.length || 0}
                      </div>
                      <p className="text-xs text-gray-400">Christmas NFTs</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Staking Tab */}
              <TabsContent value="staking" className="space-y-6">
                {/* Staking Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gray-800 border-yellow-400/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Staked</p>
                          <p className="text-2xl font-bold text-yellow-400">{stakingStats.totalStaked}</p>
                        </div>
                        <Zap className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-yellow-400/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Rewards</p>
                          <p className="text-2xl font-bold text-green-400">{stakingStats.totalRewards.toFixed(2)}</p>
                        </div>
                        <Coins className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-yellow-400/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Daily Rewards</p>
                          <p className="text-2xl font-bold text-blue-400">{stakingStats.dailyRewards.toFixed(1)}</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-yellow-400/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Staking Power</p>
                          <p className="text-2xl font-bold text-purple-400">{stakingStats.stakingPower.toFixed(1)}x</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Staked NFTs */}
                <Card className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Staked NFTs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stakedNFTs.length === 0 ? (
                      <div className="text-center py-8">
                        <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No NFTs Staked</h3>
                        <p className="text-gray-400">Start staking your Prime Mates NFTs to earn rewards</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stakedNFTs.map((nft) => (
                          <Card key={nft.id} className="bg-gray-800 border-yellow-400/20 overflow-hidden">
                            <div className="aspect-square relative">
                              <img
                                src={nft.image || "/placeholder.svg"}
                                alt={nft.name}
                                className="w-full h-full object-cover"
                              />
                              <Badge className="absolute top-3 left-3 bg-yellow-400 text-black">{nft.collection}</Badge>
                              <Badge className="absolute top-3 right-3 bg-purple-500">{nft.multiplier}x</Badge>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-bold mb-2">{nft.name}</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Days Staked:</span>
                                  <span className="text-yellow-400">{getDaysStaked(nft.stakedAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Rewards:</span>
                                  <span className="text-green-400">{nft.rewards.toFixed(2)} PMBC</span>
                                </div>
                              </div>
                              <Button
                                onClick={() => unstakeNFT(nft)}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full mt-4 border-red-400/50 text-red-400 hover:bg-red-400/10"
                              >
                                {isLoading ? "Unstaking..." : "Unstake"}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Available to Stake */}
                <Card className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Available to Stake</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {nfts.slice(0, 6).map((nft, index) => (
                        <Card key={index} className="bg-gray-800 border-yellow-400/20 overflow-hidden">
                          <div className="aspect-square relative">
                            <img
                              src={nft.metadata.image || "/placeholder.svg"}
                              alt={nft.metadata.name}
                              className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-3 left-3 bg-yellow-400 text-black">{nft.collection}</Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold mb-2">{nft.metadata.name}</h3>
                            <div className="space-y-2 text-sm mb-4">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Daily Rewards:</span>
                                <span className="text-green-400">~5.5 PMBC</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => stakeNFT(nft)}
                              disabled={isLoading}
                              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                            >
                              {isLoading ? "Staking..." : "Stake NFT"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Token Management Tab */}
              <TabsContent value="tokens" className="space-y-6">
                <TokenManagement />
              </TabsContent>

              <TabsContent value="wallets" className="space-y-6">
                <MultiWalletManager />
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-yellow-400">Inventory & History</h2>
                  <div className="flex gap-2">
                    <Button
                      variant={inventoryFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInventoryFilter("all")}
                      className={inventoryFilter === "all" ? "bg-yellow-400 text-black" : "border-yellow-400/50"}
                    >
                      All
                    </Button>
                    <Button
                      variant={inventoryFilter === "merchandise" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInventoryFilter("merchandise")}
                      className={
                        inventoryFilter === "merchandise" ? "bg-yellow-400 text-black" : "border-yellow-400/50"
                      }
                    >
                      Merchandise
                    </Button>
                    <Button
                      variant={inventoryFilter === "digital" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInventoryFilter("digital")}
                      className={inventoryFilter === "digital" ? "bg-yellow-400 text-black" : "border-yellow-400/50"}
                    >
                      Digital
                    </Button>
                    <Button
                      variant={inventoryFilter === "exclusive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInventoryFilter("exclusive")}
                      className={inventoryFilter === "exclusive" ? "bg-yellow-400 text-black" : "border-yellow-400/50"}
                    >
                      Exclusive
                    </Button>
                  </div>
                </div>

                {/* Claimable Rewards Section */}
                {claimableRewards.filter((reward) => !reward.claimed).length > 0 && (
                  <Card className="bg-gradient-to-r from-yellow-400/10 to-green-400/10 border-yellow-400/30 mb-6">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 flex items-center">
                        <Gift className="mr-2 h-5 w-5" />
                        Claimable Rewards ({claimableRewards.filter((reward) => !reward.claimed).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {claimableRewards
                          .filter((reward) => !reward.claimed)
                          .map((reward) => (
                            <Card key={reward.id} className="bg-gray-800 border-yellow-400/20">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-white mb-1">{reward.title}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{reward.description}</p>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className="bg-green-500 text-white text-xs">
                                        {reward.value} {reward.currency}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {reward.type}
                                      </Badge>
                                    </div>
                                    {reward.expiresAt && (
                                      <p className="text-xs text-red-400">
                                        Expires: {reward.expiresAt.toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  {reward.image && (
                                    <Image
                                      src={reward.image || "/placeholder.svg"}
                                      alt={reward.title}
                                      width={60}
                                      height={60}
                                      className="rounded-lg"
                                    />
                                  )}
                                </div>
                                <Button
                                  onClick={() => claimReward(reward.id)}
                                  disabled={isLoading}
                                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                                  size="sm"
                                >
                                  {isLoading ? "Claiming..." : "Claim Reward"}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Purchase History */}
                <Card className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Purchase History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {purchaseHistory
                        .filter((item) => inventoryFilter === "all" || item.category === inventoryFilter)
                        .map((item) => (
                          <Card key={item.id} className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {item.image && (
                                    <Image
                                      src={item.image || "/placeholder.svg"}
                                      alt={item.item}
                                      width={60}
                                      height={60}
                                      className="rounded-lg"
                                    />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-white">{item.item}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {item.category}
                                      </Badge>
                                      <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {item.date}
                                      </span>
                                    </div>
                                    {item.trackingNumber && (
                                      <p className="text-xs text-blue-400 mt-1">Tracking: {item.trackingNumber}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusIcon(item.status)}
                                    <Badge
                                      className={
                                        item.status === "delivered"
                                          ? "bg-green-500"
                                          : item.status === "shipped"
                                            ? "bg-blue-500"
                                            : item.status === "processing"
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                      }
                                    >
                                      {item.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-semibold text-white">
                                    {item.price} {item.currency}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center">
                      <Trophy className="mr-2 h-5 w-5" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <Card
                          key={achievement.id}
                          className={`bg-gray-800 border-2 ${
                            achievement.unlockedAt ? "border-yellow-400/40" : "border-gray-700"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">{achievement.icon}</span>
                                  <div>
                                    <h3
                                      className={`font-semibold ${
                                        achievement.unlockedAt ? "text-yellow-400" : "text-gray-500"
                                      }`}
                                    >
                                      {achievement.title}
                                    </h3>
                                    <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                                      {achievement.rarity}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                                {achievement.progress !== undefined && achievement.maxProgress && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Progress</span>
                                      <span className="text-gray-400">
                                        {achievement.progress}/{achievement.maxProgress}
                                      </span>
                                    </div>
                                    <Progress
                                      value={(achievement.progress / achievement.maxProgress) * 100}
                                      className="h-2"
                                    />
                                  </div>
                                )}
                                {achievement.unlockedAt && (
                                  <p className="text-xs text-green-400 mt-2">
                                    Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits" className="space-y-6">
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
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
