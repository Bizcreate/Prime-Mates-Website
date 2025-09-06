"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useActiveAccount, useWalletBalance } from "thirdweb/react"
import { client } from "@/lib/client"
import { ethereum, polygon } from "thirdweb/chains"
import { fetchUserNFTsFromContract } from "@/lib/web3-utils"
import { COLLECTIONS } from "@/lib/web3-config"
import { Wallet, RefreshCw, Trophy, Coins, Star, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function MemberDashboard() {
  const activeAccount = useActiveAccount()
  const address = activeAccount?.address
  const { toast } = useToast()

  const { data: ethBalance } = useWalletBalance({
    client,
    chain: ethereum,
    address: address,
  })

  const { data: polygonBalance } = useWalletBalance({
    client,
    chain: polygon,
    address: address,
  })

  const [nftData, setNftData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalNFTs, setTotalNFTs] = useState(0)

  const fetchWalletNFTs = async () => {
    if (!address) return

    console.log("[v0] Starting NFT fetch for address:", address)
    setIsLoading(true)

    try {
      const allNFTs: any[] = []

      // Fetch from all collections
      for (const collection of COLLECTIONS) {
        console.log(`[v0] Fetching NFTs from ${collection.name}...`)
        try {
          const nfts = await fetchUserNFTsFromContract(address, collection.address, collection.chain)
          console.log(`[v0] Found ${nfts.length} NFTs in ${collection.name}`)

          const nftsWithCollection = nfts.map((nft) => ({
            ...nft,
            collectionName: collection.name,
            chain: collection.chain,
          }))

          allNFTs.push(...nftsWithCollection)
        } catch (error) {
          console.error(`[v0] Error fetching from ${collection.name}:`, error)
        }
      }

      console.log(`[v0] Total NFTs found: ${allNFTs.length}`)
      setNftData(allNFTs)
      setTotalNFTs(allNFTs.length)

      if (allNFTs.length > 0) {
        toast({
          title: "NFTs Loaded",
          description: `Found ${allNFTs.length} NFTs in your wallet`,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching NFTs:", error)
      toast({
        title: "Error",
        description: "Failed to load NFT data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      console.log("[v0] Wallet connected:", address)
      fetchWalletNFTs()
    } else {
      console.log("[v0] Wallet disconnected, clearing data")
      setNftData([])
      setTotalNFTs(0)
    }
  }, [address])

  const handleRefresh = async () => {
    if (!address) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }
    await fetchWalletNFTs()
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-yellow-400/30 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to access your Prime Mates dashboard and view your NFT collection.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">Member Dashboard</h1>
            <p className="text-gray-400">Welcome back, PMBC member!</p>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div className="text-right">
              <p className="text-sm text-gray-400">Portfolio Overview</p>
              <p className="text-lg font-bold text-white">
                {totalNFTs} NFT{totalNFTs !== 1 ? "s" : ""} owned
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-yellow-400 text-black hover:bg-yellow-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-yellow-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total NFTs</p>
                  <p className="text-3xl font-bold text-yellow-400">{totalNFTs}</p>
                </div>
                <Package className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">ETH Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {ethBalance ? Number.parseFloat(ethBalance.displayValue).toFixed(4) : "0.0000"}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">MATIC Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {polygonBalance ? Number.parseFloat(polygonBalance.displayValue).toFixed(4) : "0.0000"}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Member Tier</p>
                  <p className="text-2xl font-bold text-yellow-400">{totalNFTs > 0 ? "Holder" : "Guest"}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFT Collection Display */}
        <Card className="bg-gray-900 border-yellow-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-400" />
                Your NFT Collection
              </h2>
              {totalNFTs > 0 && (
                <Badge className="bg-yellow-400 text-black">
                  {totalNFTs} NFT{totalNFTs !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-yellow-400 animate-spin mr-3" />
                <p className="text-gray-400">Loading your NFTs...</p>
              </div>
            ) : nftData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {nftData.map((nft, index) => (
                  <Card key={index} className="bg-black border-gray-700 hover:border-yellow-400/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-800 rounded-lg mb-3 overflow-hidden">
                        {nft.image ? (
                          <Image
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name || `NFT #${nft.tokenId}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-sm mb-1">
                        {nft.name || `${nft.collectionName} #${nft.tokenId}`}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2">{nft.collectionName}</p>
                      <Badge variant="outline" className="text-xs">
                        {nft.chain === "ethereum" ? "ETH" : "POLYGON"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No NFTs Found</h3>
                <p className="text-gray-500 mb-4">
                  {address
                    ? "This wallet doesn't contain any Prime Mates NFTs"
                    : "Connect your wallet to view your NFTs"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
