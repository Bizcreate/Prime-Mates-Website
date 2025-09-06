"use client"

import { useState, useEffect } from "react"
import { useActiveAccount, useDisconnect } from "thirdweb/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Users,
  Star,
  Crown,
  Zap,
  ImageIcon,
  Palette,
  Coins,
  Clock,
  TrendingUp,
  Package,
  Gift,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMultiWallet } from "@/contexts/multi-wallet-context"
import Image from "next/image"
import { useTokens } from "@/contexts/token-context"
import { COLLECTIONS } from "@/lib/web3-config"
import { fetchUserNFTsFromContract } from "@/lib/web3-utils"

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
    description?: string
    attributes?: any[]
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
  const [userNFTs, setUserNFTs] = useState<NFT[]>([])
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
  const [collections, setCollections] = useState<Collections>({ pmbc: [], pttb: [], halloween: [], christmas: [] })
  const { toast: hookToast } = useToast()

  const setWalletBalance = (balance: string) => {
    // Declare setWalletBalance
    // Implementation can be added here if needed
  }

  const setNfts = (nfts: NFT[]) => {
    setUserNFTs(nfts)
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

  const calculateUserStats = (totalNFTCount: number, collections: Collections) => {
    let tier = "Holder"
    let tierProgress = 0
    let nextTierRequirement = 3

    if (totalNFTCount >= 16) {
      tier = "Champion"
      tierProgress = 100
      nextTierRequirement = 0
    } else if (totalNFTCount >= 10) {
      tier = "Pro"
      tierProgress = ((totalNFTCount - 10) / 6) * 100
      nextTierRequirement = 16 - totalNFTCount
    } else if (totalNFTCount >= 6) {
      tier = "Amateur"
      tierProgress = ((totalNFTCount - 6) / 4) * 100
      nextTierRequirement = 10 - totalNFTCount
    } else if (totalNFTCount >= 3) {
      tier = "Grom"
      tierProgress = ((totalNFTCount - 3) / 3) * 100
      nextTierRequirement = 6 - totalNFTCount
    } else {
      tierProgress = (totalNFTCount / 3) * 100
      nextTierRequirement = 3 - totalNFTCount
    }

    setUserStats({
      nftCount: totalNFTCount,
      tier,
      tierProgress,
      rewardsEarned: totalNFTCount * 125.5, // Mock rewards calculation
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

  const fetchUserNFTs = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      console.log("[v0] Fetching NFTs for wallet:", address)
      const allNFTs: NFT[] = []

      // Fetch from each collection
      for (const collection of COLLECTIONS) {
        try {
          const nfts = await fetchUserNFTsFromContract(collection.address, address, collection.chainId)
          const formattedNFTs = nfts.map((nft) => ({
            collection: collection.name,
            metadata: {
              id: nft.tokenId,
              name: nft.name || `${collection.name} #${nft.tokenId}`,
              image: nft.image,
              description: nft.description,
              attributes: nft.attributes || [],
            },
          }))
          allNFTs.push(...formattedNFTs)
          console.log("[v0] Found", formattedNFTs.length, "NFTs in", collection.name)
        } catch (error) {
          console.error("[v0] Error fetching from", collection.name, ":", error)
        }
      }

      setUserNFTs(allNFTs)

      // Group NFTs by collection
      const groupedCollections = {
        pmbc: allNFTs.filter((nft) => nft.collection === "Prime Mates Board Club"),
        pttb: allNFTs.filter((nft) => nft.collection === "Prime To The Bone"),
        halloween: allNFTs.filter((nft) => nft.collection === "Prime Halloween"),
        christmas: allNFTs.filter((nft) => nft.collection === "Prime Mates Christmas Club"),
      }
      setCollections(groupedCollections)

      // Calculate user stats
      calculateUserStats(allNFTs.length, groupedCollections)

      if (allNFTs.length > 0) {
        hookToast({
          title: "Portfolio Loaded",
          description: `Found ${allNFTs.length} Prime Mates NFTs in your wallet!`,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching user NFTs:", error)
      hookToast({
        title: "Error",
        description: "Failed to load your NFT portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchUserNFTs()
      loadStakingData()
      loadUserProfile()
    } else {
      // Reset data when wallet disconnects
      setUserNFTs([])
      setUserStats(null)
      setCollections({ pmbc: [], pttb: [], halloween: [], christmas: [] })
    }
  }, [isConnected, address])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
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
            <p className="text-sm text-gray-400">Connected Wallet</p>
            <p className="font-mono text-sm text-yellow-500">{address}</p>
            <Button
              onClick={fetchUserNFTs}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="mt-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Portfolio
            </Button>
          </div>
        </div>

        {isLoading && (
          <Card className="bg-gray-900 border-yellow-400/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-yellow-400 mr-3" />
                <span className="text-yellow-400">Loading your NFT portfolio...</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <ImageIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{userNFTs.length}</div>
              <div className="text-sm text-gray-400">Total NFTs</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{userStats?.tier || "Holder"}</div>
              <div className="text-sm text-gray-400">Current Tier</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-400">
                {userStats?.nextTierRequirement === 0 ? "MAX" : userStats?.nextTierRequirement || "3"}
              </div>
              <div className="text-sm text-gray-400">
                {userStats?.nextTierRequirement === 0 ? "Tier Reached" : "More to Next Tier"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <Coins className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-yellow-400">1,250</div>
              <div className="text-sm text-gray-400">$SHAKA Points</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-400">890</div>
              <div className="text-sm text-gray-400">$GRIND Points</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-400">{(userStats?.rewardsEarned || 0).toFixed(2)}</div>
              <div className="text-sm text-gray-400">PMBC Rewards</div>
            </CardContent>
          </Card>
        </div>

        {userNFTs.length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-400/40 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-400 font-bold text-xl mb-2">Claimable Rewards</h3>
                  <p className="text-2xl font-bold text-white">{(userStats?.rewardsEarned || 0).toFixed(2)} PMBC</p>
                  <p className="text-sm text-gray-400">≈ ${((userStats?.rewardsEarned || 0) * 0.15).toFixed(2)} USD</p>
                </div>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 text-lg">
                  Claim Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900 border border-yellow-400/20">
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Portfolio ({userNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="staking" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Staking ({stakingStats.totalStaked})
            </TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Token Management
            </TabsTrigger>
            <TabsTrigger value="wallets" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Wallets (1)
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="benefits" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Benefits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">Prime Mates Portfolio ({userNFTs.length} NFTs)</h2>
              <Button
                onClick={fetchUserNFTs}
                disabled={isLoading}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Portfolio
              </Button>
            </div>

            {userNFTs.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-12 text-center">
                  <ImageIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No Prime Mates NFTs found</h3>
                  <p className="text-gray-500 mb-6">
                    Connect a wallet with Prime Mates NFTs to see your collection here
                  </p>
                  <Button onClick={fetchUserNFTs} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                    Refresh Portfolio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Show NFTs grouped by collection */}
                {Object.entries(collections).map(([key, nfts]) => {
                  if (nfts.length === 0) return null

                  const collectionName =
                    key === "pmbc"
                      ? "Prime Mates Board Club"
                      : key === "pttb"
                        ? "Prime To The Bone"
                        : key === "halloween"
                          ? "Prime Halloween"
                          : "Prime Mates Christmas Club"

                  return (
                    <div key={key}>
                      <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                        {collectionName}
                        <Badge variant="secondary" className="bg-gray-800">
                          {nfts.length} NFTs
                        </Badge>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {nfts.map((nft) => (
                          <Card
                            key={nft.metadata.id}
                            className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  src={nft.metadata.image || "/placeholder.svg"}
                                  alt={nft.metadata.name}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <h4 className="font-bold text-lg mb-2 text-white">{nft.metadata.name}</h4>
                              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{nft.metadata.description}</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                                >
                                  <Palette className="w-4 h-4 mr-2" />
                                  Stake
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
                                >
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ... existing code for other tabs ... */}
        </Tabs>
      </div>
    </div>
  )
}
