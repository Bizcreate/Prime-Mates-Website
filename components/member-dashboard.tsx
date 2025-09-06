"use client"

import { useState, useEffect } from "react"
import { useActiveAccount, useDisconnect } from "thirdweb/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Zap, ImageIcon, Coins, TrendingUp, Gift, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { COLLECTIONS } from "@/lib/web3-config"
import { fetchUserNFTsFromContract } from "@/lib/web3-utils"

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

interface UserStats {
  nftCount: number
  tier: string
  tierProgress: number
  rewardsEarned: number
  nextTierRequirement: number
}

export function MemberDashboard() {
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  const address = account?.address
  const isConnected = !!account

  const [isLoading, setIsLoading] = useState(false)
  const [userNFTs, setUserNFTs] = useState<NFT[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const { toast } = useToast()

  const fetchUserNFTs = async () => {
    if (!address) {
      console.log("[v0] No address available for NFT fetch")
      return
    }

    setIsLoading(true)
    console.log("[v0] Starting NFT fetch for address:", address)
    console.log("[v0] Available collections:", COLLECTIONS.length)

    try {
      const allNFTs: NFT[] = []

      for (const collection of COLLECTIONS) {
        try {
          console.log(
            "[v0] Fetching from collection:",
            collection.name,
            "at address:",
            collection.address,
            "on chain:",
            collection.chainId,
          )

          const startTime = Date.now()
          const nfts = await fetchUserNFTsFromContract(collection.address, address, collection.chainId)
          const endTime = Date.now()

          console.log("[v0] Collection", collection.name, "fetch completed in", endTime - startTime, "ms")
          console.log("[v0] Raw NFTs returned:", nfts)

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
          console.log("[v0] Formatted NFTs:", formattedNFTs)
        } catch (error) {
          console.error("[v0] Error fetching from", collection.name, ":", error)
          console.error("[v0] Error details:", error instanceof Error ? error.message : String(error))
        }
      }

      console.log("[v0] Total NFTs found:", allNFTs.length)
      console.log("[v0] All NFTs:", allNFTs)

      setUserNFTs(allNFTs)
      calculateUserStats(allNFTs.length)

      if (allNFTs.length > 0) {
        toast({
          title: "Portfolio Loaded Successfully",
          description: `Found ${allNFTs.length} Prime Mates NFTs across ${COLLECTIONS.length} collections!`,
        })
      } else {
        toast({
          title: "No NFTs Found",
          description: `Searched ${COLLECTIONS.length} collections but found no Prime Mates NFTs in wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Critical error in fetchUserNFTs:", error)
      console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
      toast({
        title: "Portfolio Load Failed",
        description: `Failed to load NFT portfolio: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      console.log("[v0] NFT fetch process completed")
    }
  }

  const calculateUserStats = (totalNFTCount: number) => {
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
      rewardsEarned: totalNFTCount * 125.5,
      nextTierRequirement,
    })
  }

  useEffect(() => {
    console.log("[v0] useEffect triggered - isConnected:", isConnected, "address:", address)

    if (isConnected && address) {
      console.log("[v0] Wallet connected, starting NFT fetch...")
      fetchUserNFTs()
    } else {
      console.log("[v0] Wallet not connected or no address, clearing data")
      setUserNFTs([])
      setUserStats(null)
    }
  }, [isConnected, address])

  useEffect(() => {
    console.log("[v0] Account state changed:", {
      account: account ? "Connected" : "Disconnected",
      address: address || "None",
      isConnected,
    })
  }, [account, address, isConnected])

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
          <div className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 text-lg rounded-lg inline-block">
            Use the Connect Wallet button in the navigation
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

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">Your Prime Mates NFTs ({userNFTs.length})</h2>
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
                Refresh
              </Button>
            </div>

            {userNFTs.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No Prime Mates NFTs found</h3>
                <p className="text-gray-500 mb-6">Your wallet doesn't contain any Prime Mates NFTs yet</p>
                <Button onClick={fetchUserNFTs} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  Refresh Portfolio
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userNFTs.map((nft) => (
                  <Card
                    key={nft.metadata.id}
                    className="bg-gray-800 border-gray-700 hover:border-yellow-400 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-700">
                        <img
                          src={nft.metadata.image || "/placeholder.svg"}
                          alt={nft.metadata.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-bold text-lg mb-2 text-white">{nft.metadata.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{nft.collection}</p>
                      <Button size="sm" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
