"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useActiveAccount, useWalletBalance, useReadContract } from "thirdweb/react"
import { client } from "@/packages/prime-shared/thirdweb/client"
import { ethereum, polygon } from "thirdweb/chains"
import { getContract } from "thirdweb"
import { Wallet, Trophy, Coins, Star, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

  const pmbcContract = getContract({
    client,
    chain: ethereum,
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
  })

  const pttbContract = getContract({
    client,
    chain: polygon,
    address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75",
  })

  const { data: pmbcBalance } = useReadContract({
    contract: pmbcContract,
    method: "function balanceOf(address owner) view returns (uint256)",
    params: [address || "0x0"],
  })

  const { data: pttbBalance } = useReadContract({
    contract: pttbContract,
    method: "function balanceOf(address owner) view returns (uint256)",
    params: [address || "0x0"],
  })

  const totalNFTs = (pmbcBalance ? Number(pmbcBalance) : 0) + (pttbBalance ? Number(pttbBalance) : 0)

  console.log("[v0] PMBC Balance:", pmbcBalance)
  console.log("[v0] PTTB Balance:", pttbBalance)
  console.log("[v0] Total NFTs:", totalNFTs)

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

            {totalNFTs > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pmbcBalance && Number(pmbcBalance) > 0 && (
                  <Card className="bg-black border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-white mb-2">Prime Mates Board Club</h3>
                      <p className="text-2xl font-bold text-yellow-400">{Number(pmbcBalance)} NFTs</p>
                      <Badge variant="outline" className="mt-2">
                        Ethereum
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {pttbBalance && Number(pttbBalance) > 0 && (
                  <Card className="bg-black border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-white mb-2">Prime To The Bone</h3>
                      <p className="text-2xl font-bold text-yellow-400">{Number(pttbBalance)} NFTs</p>
                      <Badge variant="outline" className="mt-2">
                        Polygon
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No NFTs Found</h3>
                <p className="text-gray-500 mb-4">This wallet doesn't contain any Prime Mates NFTs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
