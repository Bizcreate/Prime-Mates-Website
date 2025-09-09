"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useActiveAccount, useWalletBalance } from "thirdweb/react"
import { thirdwebClient } from "@/packages/prime-shared/thirdweb/client"
import { ethereum, polygon } from "thirdweb/chains"
import { getContract } from "thirdweb"
import { Wallet, Star, Package, Plus, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { useReadContract } from "thirdweb/react"
import StatsCard from "./StatsCard"
import { stakeNFT, unstakeNFT, getStakedNFTs } from "../lib/staking"

interface NFTData {
  tokenId: string
  name: string
  image: string
  collection: string
  chain: string
}

interface UserProfile {
  id: string
  email?: string
  connectedWallets: string[]
  createdAt: string
}

interface StakingData {
  stakedNFTs: number
  totalPoints: number
}

export function MemberDashboard() {
  const activeAccount = useActiveAccount()
  const address = activeAccount?.address
  const { toast } = useToast()
  const [userNFTs, setUserNFTs] = useState<NFTData[]>([])
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [stakingData, setStakingData] = useState<StakingData>({ stakedNFTs: 0, totalPoints: 0 })
  const [stakingLoading, setStakingLoading] = useState<string | null>(null)

  const { data: ethBalance } = useWalletBalance({
    client: thirdwebClient,
    chain: ethereum,
    address: address,
  })

  const { data: polygonBalance } = useWalletBalance({
    client: thirdwebClient,
    chain: polygon,
    address: address,
  })

  const pmbcContract = getContract({
    client: thirdwebClient,
    chain: ethereum,
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
  })

  const pttbContract = getContract({
    client: thirdwebClient,
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

  const fetchNFTData = async (contractAddress: string, tokenId: number, chain: string, collectionName: string) => {
    try {
      console.log(`[v0] Fetching NFT data for ${collectionName} #${tokenId}`)

      // Get token URI
      const tokenURIResponse = await fetch(
        `/api/tokenURI?contract=${contractAddress}&tokenId=${tokenId}&chain=${chain}`,
      )
      const { tokenURI } = await tokenURIResponse.json()

      if (tokenURI) {
        // Convert IPFS URL to HTTP
        const httpUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
        console.log(`[v0] Fetching metadata from: ${httpUrl}`)

        // Fetch metadata
        const response = await fetch(httpUrl)
        const metadata = await response.json()

        const nftData = {
          tokenId: tokenId.toString(),
          name: metadata.name || `${collectionName} #${tokenId}`,
          image: metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || "/prime-mates-nft.jpg",
          collection: collectionName,
          chain: chain,
        }

        console.log(`[v0] Successfully fetched NFT data:`, nftData)
        return nftData
      }
    } catch (error) {
      console.error(`[v0] Error fetching NFT ${tokenId}:`, error)
      return {
        tokenId: tokenId.toString(),
        name: `${collectionName} #${tokenId}`,
        image: "/prime-mates-nft.jpg",
        collection: collectionName,
        chain: chain,
      }
    }
  }

  const loadUserNFTs = async () => {
    if (!address || (!pmbcBalance && !pttbBalance)) return

    setLoading(true)
    const nfts: NFTData[] = []

    try {
      // Fetch PMBC NFTs
      if (pmbcBalance && Number(pmbcBalance) > 0) {
        for (let i = 0; i < Number(pmbcBalance); i++) {
          try {
            const tokenIdResponse = await fetch(
              `/api/tokenOfOwnerByIndex?contract=0x12662b6a2a424a0090b7d09401fb775a9b968898&owner=${address}&index=${i}&chain=ethereum`,
            )
            const { tokenId } = await tokenIdResponse.json()

            if (tokenId) {
              const nftData = await fetchNFTData(
                "0x12662b6a2a424a0090b7d09401fb775a9b968898",
                Number(tokenId),
                "ethereum",
                "Prime Mates Board Club",
              )
              if (nftData) nfts.push(nftData)
            }
          } catch (error) {
            console.error(`[v0] Error fetching PMBC NFT ${i}:`, error)
          }
        }
      }

      // Fetch PTTB NFTs
      if (pttbBalance && Number(pttbBalance) > 0) {
        for (let i = 0; i < Number(pttbBalance); i++) {
          try {
            const tokenIdResponse = await fetch(
              `/api/tokenOfOwnerByIndex?contract=0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75&owner=${address}&index=${i}&chain=polygon`,
            )
            const { tokenId } = await tokenIdResponse.json()

            if (tokenId) {
              const nftData = await fetchNFTData(
                "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75",
                Number(tokenId),
                "polygon",
                "Prime To The Bone",
              )
              if (nftData) nfts.push(nftData)
            }
          } catch (error) {
            console.error(`[v0] Error fetching PTTB NFT ${i}:`, error)
          }
        }
      }

      setUserNFTs(nfts)
      console.log("[v0] Loaded NFTs:", nfts)
    } catch (error) {
      console.error("[v0] Error loading NFTs:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async () => {
    if (!address) return

    try {
      // Check if profile exists in Firebase
      const response = await fetch(`/api/profile/${address}`)
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
      } else {
        // Create new profile
        const newProfile = {
          id: address,
          connectedWallets: [address],
          createdAt: new Date().toISOString(),
        }
        setUserProfile(newProfile)
      }
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
    }
  }

  const addWalletToProfile = async (walletAddress: string) => {
    if (!userProfile) return

    try {
      const updatedProfile = {
        ...userProfile,
        connectedWallets: [...userProfile.connectedWallets, walletAddress],
      }

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      })

      if (response.ok) {
        setUserProfile(updatedProfile)
        toast({
          title: "Wallet Added",
          description: "Successfully linked wallet to your profile",
        })
      }
    } catch (error) {
      console.error("[v0] Error adding wallet:", error)
      toast({
        title: "Error",
        description: "Failed to add wallet to profile",
        variant: "destructive",
      })
    }
  }

  const handleStaking = async (nft: NFTData, action: "stake" | "unstake") => {
    if (!address) return

    setStakingLoading(`${nft.collection}-${nft.tokenId}`)

    try {
      const stakeData = {
        nft: {
          token_id: nft.tokenId,
          token_address:
            nft.collection === "Prime Mates Board Club"
              ? "0x12662b6a2a424a0090b7d09401fb775a9b968898"
              : "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75",
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        stakePeriod: 30,
        rewardPercentage: 10,
      }

      let success = false
      if (action === "stake") {
        success = await stakeNFT(address, stakeData)
      } else {
        success = await unstakeNFT(address, nft.tokenId)
      }

      if (success) {
        await loadStakingData()
        toast({
          title: action === "stake" ? "NFT Staked Successfully" : "NFT Unstaked Successfully",
          description: `${nft.name} has been ${action}d`,
        })
      }
    } catch (error) {
      console.error(`[v0] Error ${action}ing NFT:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} NFT`,
        variant: "destructive",
      })
    } finally {
      setStakingLoading(null)
    }
  }

  const loadStakingData = async () => {
    if (!address) return

    try {
      const stakedNFTs = await getStakedNFTs(address)
      setStakingData({
        stakedNFTs: stakedNFTs.length,
        totalPoints: stakedNFTs.reduce((total: number, stake: any) => total + (stake.rewardPercentage || 0), 0),
      })
    } catch (error) {
      console.error("[v0] Error loading staking data:", error)
    }
  }

  const linkAdditionalWallet = async () => {
    // This would integrate with thirdweb to connect additional wallets
    try {
      // For now, show a prompt for manual wallet address entry
      const walletAddress = prompt("Enter wallet address to link:")
      if (walletAddress && walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        await addWalletToProfile(walletAddress)
      } else if (walletAddress) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid Ethereum address",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error linking wallet:", error)
    }
  }

  useEffect(() => {
    if (address) {
      console.log(`[v0] Wallet connected: ${address}`)
      loadUserProfile()
      loadStakingData()
    }
  }, [address])

  useEffect(() => {
    if (address && (pmbcBalance !== undefined || pttbBalance !== undefined)) {
      console.log(`[v0] Balances loaded - PMBC: ${pmbcBalance}, PTTB: ${pttbBalance}`)
      loadUserNFTs()
    }
  }, [address, pmbcBalance, pttbBalance])

  const totalNFTs = (pmbcBalance ? Number(pmbcBalance) : 0) + (pttbBalance ? Number(pttbBalance) : 0)

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
            <Button
              onClick={() => setShowProfileModal(true)}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <User className="h-4 w-4 mr-2" />
              Profile ({userProfile?.connectedWallets.length || 1} wallet
              {(userProfile?.connectedWallets.length || 1) !== 1 ? "s" : ""})
            </Button>

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
          <StatsCard title="Total NFTs" value={totalNFTs} />

          <StatsCard
            title="ETH Balance"
            value={ethBalance ? Number.parseFloat(ethBalance.displayValue).toFixed(4) : "0.0000"}
          />

          <StatsCard
            title="MATIC Balance"
            value={polygonBalance ? Number.parseFloat(polygonBalance.displayValue).toFixed(4) : "0.0000"}
          />

          <StatsCard title="Member Tier" value={totalNFTs > 0 ? "Holder" : "Guest"} />
        </div>

        {/* NFT Collection */}
        <Card className="bg-gray-900 border-yellow-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-400" />
                Your NFT Collection
              </h2>
              {totalNFTs > 0 && (
                <div className="flex items-center gap-4">
                  <Badge className="bg-yellow-400 text-black">
                    {totalNFTs} NFT{totalNFTs !== 1 ? "s" : ""}
                  </Badge>
                  <Badge className="bg-green-600 text-white">{stakingData.stakedNFTs} Staked</Badge>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your NFTs...</p>
              </div>
            ) : totalNFTs > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userNFTs.map((nft) => (
                  <Card
                    key={`${nft.collection}-${nft.tokenId}`}
                    className="bg-black border-gray-700 overflow-hidden hover:border-yellow-400/50 transition-colors"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={nft.image || "/prime-mates-nft.jpg"}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/prime-mates-nft.jpg"
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-white mb-1 truncate">{nft.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{nft.collection}</p>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {nft.chain === "ethereum" ? "Ethereum" : "Polygon"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStaking(nft, "stake")}
                          disabled={stakingLoading === `${nft.collection}-${nft.tokenId}`}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          {stakingLoading === `${nft.collection}-${nft.tokenId}` ? "..." : "Stake"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStaking(nft, "unstake")}
                          disabled={stakingLoading === `${nft.collection}-${nft.tokenId}`}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-1"
                        >
                          {stakingLoading === `${nft.collection}-${nft.tokenId}` ? "..." : "Unstake"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-gray-900 border-yellow-400/30 max-w-md w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Profile Settings</h3>
                  <Button onClick={() => setShowProfileModal(false)} variant="ghost" size="sm">
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Connected Wallets</p>
                    {userProfile?.connectedWallets.map((wallet, index) => (
                      <div
                        key={wallet}
                        className="flex items-center justify-between p-3 bg-black rounded border border-gray-700 mb-2"
                      >
                        <span className="text-sm text-white font-mono">
                          {wallet.slice(0, 8)}...{wallet.slice(-6)}
                        </span>
                        {index === 0 && <Badge className="bg-yellow-400 text-black">Primary</Badge>}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={linkAdditionalWallet}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Link Another Wallet
                  </Button>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-400">{stakingData.stakedNFTs}</p>
                        <p className="text-xs text-gray-400">Staked NFTs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">{stakingData.totalPoints}</p>
                        <p className="text-xs text-gray-400">Total Points</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
