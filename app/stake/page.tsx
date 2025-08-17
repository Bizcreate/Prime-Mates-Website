"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { web3Service } from "@/lib/web3"
import { useToast } from "@/hooks/use-toast"
import { Coins, Clock, TrendingUp, Zap, Gift, Star } from "lucide-react"

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

export default function StakePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [stakedNFTs, setStakedNFTs] = useState<StakedNFT[]>([])
  const [availableNFTs, setAvailableNFTs] = useState<any[]>([])
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: 0,
    totalRewards: 0,
    dailyRewards: 0,
    stakingPower: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      const address = await web3Service.getConnectedWallet()
      if (address) {
        setIsConnected(true)
        setWalletAddress(address)
        await loadStakingData(address)
      }
    } catch (error) {
      console.log("No wallet connected")
    }
  }

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      const address = await web3Service.connectWallet()
      setIsConnected(true)
      setWalletAddress(address)
      await loadStakingData(address)
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      })
    } catch (error: any) {
      console.log("[v0] Wallet connection failed:", error)

      let errorMessage = "Failed to connect wallet. Please try again."

      if (
        error?.code === 4001 ||
        error?.message?.includes("user rejected") ||
        error?.message?.includes("User rejected")
      ) {
        errorMessage = "Connection cancelled. Please click 'Connect' or 'Approve' when your wallet popup appears."
      } else if (error?.message?.includes("MetaMask is not installed")) {
        errorMessage = "MetaMask is not installed. Please install MetaMask to continue."
      }

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStakingData = async (address: string) => {
    try {
      // Load staked NFTs (mock data for now)
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
        {
          id: "2",
          collection: "PTTB",
          tokenId: "567",
          stakedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          rewards: 45.2,
          multiplier: 1.5,
          image:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8875.PNG-UfJS6bLCgHIycoiaj9kpwx4DnI9aKS.png",
          name: "Prime to the Bone #567",
        },
      ]

      setStakedNFTs(mockStakedNFTs)

      // Calculate staking stats
      const totalRewards = mockStakedNFTs.reduce((sum, nft) => sum + nft.rewards, 0)
      const dailyRewards = mockStakedNFTs.length * 5.5 // Base daily rate

      setStakingStats({
        totalStaked: mockStakedNFTs.length,
        totalRewards,
        dailyRewards,
        stakingPower: mockStakedNFTs.reduce((sum, nft) => sum + nft.multiplier, 0),
      })

      // Load available NFTs for staking
      const userNFTs = await web3Service.getUserNFTs(address)
      setAvailableNFTs(userNFTs.slice(0, 3)) // Show first 3 for demo
    } catch (error) {
      console.error("Error loading staking data:", error)
    }
  }

  const stakeNFT = async (nft: any) => {
    try {
      setIsLoading(true)
      // Implement staking logic here
      toast({
        title: "NFT Staked",
        description: `Successfully staked ${nft.name}`,
      })
      await loadStakingData(walletAddress)
    } catch (error) {
      toast({
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
      // Implement unstaking logic here
      toast({
        title: "NFT Unstaked",
        description: `Successfully unstaked ${nft.name}`,
      })
      await loadStakingData(walletAddress)
    } catch (error) {
      toast({
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
      // Implement reward claiming logic here
      toast({
        title: "Rewards Claimed",
        description: `Successfully claimed ${stakingStats.totalRewards.toFixed(2)} PMBC tokens`,
      })
      await loadStakingData(walletAddress)
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysStaked = (stakedAt: Date) => {
    return Math.floor((Date.now() - stakedAt.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">Prime Mates Staking</h1>
              <p className="text-gray-300 text-lg">
                Stake your Prime Mates NFTs to earn passive rewards and unlock exclusive benefits
              </p>
            </div>

            <Card className="bg-gray-800 border-yellow-400/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-6">
                  Connect your wallet to start staking your Prime Mates NFTs and earning rewards
                </p>

                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400 text-sm font-medium mb-2">💡 Connection Tip:</p>
                  <p className="text-gray-300 text-sm">
                    When your wallet popup appears, make sure to click "Connect" or "Approve" to proceed with staking.
                  </p>
                </div>

                <Button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3"
                >
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-gray-800 border-yellow-400/20">
                <CardContent className="p-6 text-center">
                  <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Earn Rewards</h3>
                  <p className="text-gray-400 text-sm">Earn PMBC tokens daily by staking your NFTs</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-yellow-400/20">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Multipliers</h3>
                  <p className="text-gray-400 text-sm">Higher tier NFTs earn bonus multipliers</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-yellow-400/20">
                <CardContent className="p-6 text-center">
                  <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Exclusive Access</h3>
                  <p className="text-gray-400 text-sm">Unlock special perks and early access</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Prime Mates Staking</h1>
          <p className="text-gray-400">Stake your NFTs to earn passive rewards</p>
        </div>

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

        {/* Claim Rewards */}
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

        <Tabs defaultValue="staked" className="space-y-6">
          <TabsList className="bg-gray-800 border-yellow-400/20">
            <TabsTrigger value="staked" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Staked NFTs ({stakedNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              Available to Stake ({availableNFTs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staked" className="space-y-6">
            {stakedNFTs.length === 0 ? (
              <Card className="bg-gray-800 border-yellow-400/20">
                <CardContent className="p-12 text-center">
                  <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No NFTs Staked</h3>
                  <p className="text-gray-400">Start staking your Prime Mates NFTs to earn rewards</p>
                </CardContent>
              </Card>
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
                        <div className="flex justify-between">
                          <span className="text-gray-400">Multiplier:</span>
                          <span className="text-purple-400">{nft.multiplier}x</span>
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
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            {availableNFTs.length === 0 ? (
              <Card className="bg-gray-800 border-yellow-400/20">
                <CardContent className="p-12 text-center">
                  <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No NFTs Available</h3>
                  <p className="text-gray-400">All your Prime Mates NFTs are currently staked</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableNFTs.map((nft, index) => (
                  <Card key={index} className="bg-gray-800 border-yellow-400/20 overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={
                          nft.image ||
                          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pmbc1.GIF-2YlHT4ki8pFi2FuczRbVv9KvZrgEG2.gif" ||
                          "/placeholder.svg"
                        }
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-yellow-400 text-black">{nft.collection}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2">{nft.name}</h3>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Collection:</span>
                          <span className="text-yellow-400">{nft.collection}</span>
                        </div>
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
