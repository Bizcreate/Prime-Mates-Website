"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, Star, Package, User, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import StatsCard from "./StatsCard"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"

import { useActiveAccount, useWalletBalance } from "thirdweb/react"
import { ethereum, polygon } from "thirdweb/chains"
import { getOwnedNFTs } from "thirdweb/extensions/erc721"
import { thirdwebClient } from "@/packages/prime-shared/thirdweb/client"

import { stakeNFT, unstakeNFT, getStakedNFTs } from "../lib/staking"

const ProfileCreationModal = dynamic(
  () => import("./ProfileCreationModal").then((mod) => ({ default: mod.ProfileCreationModal })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-yellow-400/30 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Loading Profile Setup...</h2>
            <p className="text-gray-400">Preparing your Prime Mates experience</p>
          </CardContent>
        </Card>
      </div>
    ),
  },
)

const AuthModal = dynamic(() => import("./AuthModal").then((mod) => ({ default: mod.AuthModal })), { ssr: false })

// --- Types ------------------------------------------------------------------
interface NFTData {
  tokenId: string
  name: string
  image: string
  collection: string
  chain: "ethereum" | "polygon"
  tokenAddress: string
}

interface UserProfile {
  uid?: string
  id: string
  name?: string
  email?: string
  connectedWallets: string[]
  primaryWallet?: string
  createdAt: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  memberTier?: string
  totalNFTs?: number
  stakingPoints?: number
}

interface StakingData {
  stakedNFTs: number
  totalPoints: number
}

// --- Constants --------------------------------------------------------------
const PMBC_ADDR = "0x12662b6a2a424a0090b7d09401fb775a9b968898" // Ethereum
const PTTB_ADDR = "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75" // Polygon
const HALLOWEEN_ADDR = "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8" // Ethereum
const CHRISTMAS_ADDR = "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf" // Polygon

const IPFS_GATEWAYS = ["https://ipfs.io/ipfs/", "https://cloudflare-ipfs.com/ipfs/", "https://nftstorage.link/ipfs/"]

function ipfsToHttp(url?: string): string | undefined {
  if (!url) return undefined
  if (!url.startsWith("ipfs://")) return url
  const cidPath = url.replace("ipfs://", "")
  return `${IPFS_GATEWAYS[0]}${cidPath}`
}

function pickImage(metadata: any): string | undefined {
  return (
    ipfsToHttp(metadata?.image) ||
    ipfsToHttp(metadata?.image_url) ||
    ipfsToHttp(metadata?.imageURI) ||
    ipfsToHttp(metadata?.animation_url) ||
    "/prime-mates-nft.jpg"
  )
}

function chainLabel(chainId: number): "ethereum" | "polygon" {
  return chainId === 1 ? "ethereum" : "polygon"
}

export function MemberDashboard() {
  const activeAccount = useActiveAccount()
  const address = activeAccount?.address
  const { toast } = useToast()
  const router = useRouter()

  const [userNFTs, setUserNFTs] = useState<NFTData[]>([])
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showProfileCreation, setShowProfileCreation] = useState(false)
  const [stakingData, setStakingData] = useState<StakingData>({ stakedNFTs: 0, totalPoints: 0 })
  const [stakingLoading, setStakingLoading] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentFirebaseUser, setCurrentFirebaseUser] = useState<any>(null)

  const { data: ethBalance } = useWalletBalance({ client: thirdwebClient, chain: ethereum, address })
  const { data: polygonBalance } = useWalletBalance({ client: thirdwebClient, chain: polygon, address })

  const totalNFTs = userNFTs.length

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[v0] Firebase Auth state changed:", user?.uid || "signed out")
      setCurrentFirebaseUser(user)
    })
    return () => unsubscribe()
  }, [])

  async function loadNFTs() {
    if (!address) return
    setLoading(true)
    console.log("[v0] Loading NFTs for address:", address)

    try {
      const owned: NFTData[] = []

      // Fetch Prime Halloween NFTs from Ethereum
      try {
        console.log("[v0] Fetching Prime Halloween NFTs from Ethereum...")
        const halloweenNFTs = await getOwnedNFTs({
          contract: {
            client: thirdwebClient,
            chain: ethereum,
            address: HALLOWEEN_ADDR,
          },
          owner: address,
          includeMetadata: true,
        })

        console.log("[v0] Found Prime Halloween NFTs:", halloweenNFTs.length)

        for (const nft of halloweenNFTs) {
          owned.push({
            tokenId: nft.id.toString(),
            name: nft.metadata?.name || `Prime Halloween #${nft.id.toString()}`,
            image: pickImage(nft.metadata) ?? "/prime-mates-nft.jpg",
            collection: "Prime Halloween Board Club",
            chain: "ethereum",
            tokenAddress: HALLOWEEN_ADDR,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching Prime Halloween NFTs:", error)
      }

      // Fetch Prime Christmas NFTs from Polygon
      try {
        console.log("[v0] Fetching Prime Christmas NFTs from Polygon...")
        const christmasNFTs = await getOwnedNFTs({
          contract: {
            client: thirdwebClient,
            chain: polygon,
            address: CHRISTMAS_ADDR,
          },
          owner: address,
          includeMetadata: true,
        })

        console.log("[v0] Found Prime Christmas NFTs:", christmasNFTs.length)

        for (const nft of christmasNFTs) {
          owned.push({
            tokenId: nft.id.toString(),
            name: nft.metadata?.name || `Prime Christmas #${nft.id.toString()}`,
            image: pickImage(nft.metadata) ?? "/prime-mates-nft.jpg",
            collection: "Prime Mates Christmas Club",
            chain: "polygon",
            tokenAddress: CHRISTMAS_ADDR,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching Prime Christmas NFTs:", error)
      }

      // Fetch PMBC NFTs from Ethereum
      try {
        console.log("[v0] Fetching PMBC NFTs from Ethereum...")
        const pmbcNFTs = await getOwnedNFTs({
          contract: {
            client: thirdwebClient,
            chain: ethereum,
            address: PMBC_ADDR,
          },
          owner: address,
          includeMetadata: true,
        })

        console.log("[v0] Found PMBC NFTs:", pmbcNFTs.length)

        for (const nft of pmbcNFTs) {
          owned.push({
            tokenId: nft.id.toString(),
            name: nft.metadata?.name || `PMBC #${nft.id.toString()}`,
            image: pickImage(nft.metadata) ?? "/prime-mates-nft.jpg",
            collection: "Prime Mates Board Club",
            chain: "ethereum",
            tokenAddress: PMBC_ADDR,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching PMBC NFTs:", error)
      }

      // Fetch PTTB NFTs from Polygon
      try {
        console.log("[v0] Fetching PTTB NFTs from Polygon...")
        const pttbNFTs = await getOwnedNFTs({
          contract: {
            client: thirdwebClient,
            chain: polygon,
            address: PTTB_ADDR,
          },
          owner: address,
          includeMetadata: true,
        })

        console.log("[v0] Found PTTB NFTs:", pttbNFTs.length)

        for (const nft of pttbNFTs) {
          owned.push({
            tokenId: nft.id.toString(),
            name: nft.metadata?.name || `PTTB #${nft.id.toString()}`,
            image: pickImage(nft.metadata) ?? "/prime-mates-nft.jpg",
            collection: "Prime To The Bone",
            chain: "polygon",
            tokenAddress: PTTB_ADDR,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching PTTB NFTs:", error)
      }

      // Sort: Ethereum first, then Polygon by tokenId
      owned.sort((a, b) =>
        a.chain === b.chain ? Number(a.tokenId) - Number(b.tokenId) : a.chain.localeCompare(b.chain),
      )

      setUserNFTs(owned)
      console.log("[v0] Total NFTs loaded:", owned.length)
    } catch (err) {
      console.error("[v0] loadNFTs error", err)
      toast({ title: "Failed to load NFTs", description: String(err), variant: "destructive" })
      setUserNFTs([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStaking(nft: NFTData, action: "stake" | "unstake") {
    if (!address) return
    setStakingLoading(`${nft.collection}-${nft.tokenId}`)
    try {
      const stakeData = {
        nft: {
          token_id: nft.tokenId,
          token_address: nft.tokenAddress,
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stakePeriod: 30,
        rewardPercentage: 10,
      }
      let success = false
      success = action === "stake" ? await stakeNFT(address, stakeData) : await unstakeNFT(address, nft.tokenId)
      if (success) {
        await loadStakingData()
        toast({
          title: action === "stake" ? "NFT Staked Successfully" : "NFT Unstaked Successfully",
          description: `${nft.name} has been ${action}d`,
        })
      }
    } catch (err) {
      console.error(`[v0] ${action} error`, err)
      toast({ title: "Error", description: `Failed to ${action} NFT`, variant: "destructive" })
    } finally {
      setStakingLoading(null)
    }
  }

  async function loadStakingData() {
    if (!address) return
    try {
      const staked = await getStakedNFTs(address)
      setStakingData({
        stakedNFTs: staked.length,
        totalPoints: staked.reduce((total: number, s: any) => total + (s.rewardPercentage || 0), 0),
      })
    } catch (err) {
      console.error("[v0] staking error", err)
    }
  }

  async function loadUserProfile() {
    if (!address) return
    console.log("[v0] Loading user profile for address:", address)

    try {
      // First check if wallet is already linked to a user
      const walletLinkRes = await fetch(`/api/wallet-link/${address}`)
      if (walletLinkRes.ok) {
        const linkData = await walletLinkRes.json()
        console.log("[v0] Found wallet link:", linkData)

        // Load user profile by Firebase UID
        const profileRes = await fetch(`/api/profile/uid/${linkData.userId}`)
        if (profileRes.ok) {
          const profile = await profileRes.json()
          console.log("[v0] Found linked profile:", profile)
          setUserProfile(profile)
          return
        }
      }

      // Check if user is already signed in to Firebase
      if (currentFirebaseUser) {
        console.log("[v0] User already signed in to Firebase, linking wallet...")

        // Load existing profile and link wallet
        const profileRes = await fetch(`/api/profile/uid/${currentFirebaseUser.uid}`)
        if (profileRes.ok) {
          const profile = await profileRes.json()

          // Add wallet if not already connected
          if (!profile.connectedWallets.includes(address)) {
            await addWalletToProfile(address, profile)
          } else {
            setUserProfile(profile)
          }
          return
        }
      }

      // Check for legacy wallet-based profile
      const res = await fetch(`/api/profile/${address}`)
      if (res.ok) {
        const profile = await res.json()
        console.log("[v0] Found existing wallet-based profile:", profile)
        setUserProfile(profile)
      } else {
        console.log("[v0] No existing profile found, showing auth options")
        setShowAuthModal(true)
      }
    } catch (err) {
      console.error("[v0] profile error", err)
      setShowAuthModal(true)
    }
  }

  async function addWalletToProfile(walletAddress: string, existingProfile?: any) {
    const profile = existingProfile || userProfile
    if (!profile) return

    try {
      const updatedProfile = {
        ...profile,
        connectedWallets: [...(profile.connectedWallets || []), walletAddress],
        updatedAt: new Date().toISOString(),
      }

      // Update in Firestore using UID
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      })

      if (res.ok) {
        // Create wallet link
        await fetch("/api/wallet-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress,
            userId: profile.uid,
          }),
        })

        setUserProfile(updatedProfile)
        toast({ title: "Wallet Linked", description: "Successfully linked wallet to your profile" })
      }
    } catch (err) {
      console.error("[v0] addWallet error", err)
      toast({ title: "Error", description: "Failed to add wallet to profile", variant: "destructive" })
    }
  }

  async function linkAdditionalWallet() {
    try {
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
    } catch (err) {
      console.error("[v0] link wallet error", err)
    }
  }

  const handleProfileCreated = (profile: UserProfile) => {
    console.log("[v0] Profile created successfully:", profile)
    setUserProfile(profile)
    setShowProfileCreation(false)
    toast({
      title: "Welcome to Prime Mates!",
      description: "Your profile has been created successfully. Loading your NFTs...",
    })
    // Load NFTs after profile creation
    loadNFTs()
    loadStakingData()
  }

  const handleAuthSuccess = (profile: any) => {
    console.log("[v0] Auth successful:", profile)
    setUserProfile(profile)
    setShowAuthModal(false)
    toast({
      title: "Welcome back!",
      description: "Your wallet has been linked to your account.",
    })
    // Load NFTs after authentication
    loadNFTs()
    loadStakingData()
  }

  useEffect(() => {
    if (address) {
      loadUserProfile()
    }
  }, [address, currentFirebaseUser])

  const hasWallet = Boolean(address)

  const portfolioOverview = useMemo(() => `${totalNFTs} NFT${totalNFTs !== 1 ? "s" : ""} owned`, [totalNFTs])

  if (showAuthModal && address) {
    return (
      <AuthModal
        walletAddress={address}
        onAuthSuccess={handleAuthSuccess}
        onClose={() => setShowAuthModal(false)}
        onCreateNew={() => {
          setShowAuthModal(false)
          setShowProfileCreation(true)
        }}
      />
    )
  }

  if (showProfileCreation && address) {
    return (
      <ProfileCreationModal
        walletAddress={address}
        onProfileCreated={handleProfileCreated}
        onClose={() => setShowProfileCreation(false)}
      />
    )
  }

  if (!hasWallet) {
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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-yellow-400/30 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Loading Profile...</h2>
            <p className="text-gray-400">Setting up your Prime Mates experience</p>
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
            <p className="text-gray-400">Welcome back, {userProfile.name || "PMBC member"}!</p>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Button
              onClick={() => router.push("/profile")}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <User className="h-4 w-4 mr-2" />
              Profile ({userProfile?.connectedWallets.length || 1} wallet
              {(userProfile?.connectedWallets.length || 1) !== 1 ? "s" : ""})
            </Button>

            <div className="text-right">
              <p className="text-sm text-gray-400">Portfolio Overview</p>
              <p className="text-lg font-bold text-white">{portfolioOverview}</p>
            </div>
            <Button onClick={loadNFTs} variant="ghost" className="text-gray-400 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
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
          <StatsCard title="Member Tier" value={userProfile.memberTier || (totalNFTs > 0 ? "Holder" : "Guest")} />
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
                    key={`${nft.tokenAddress}-${nft.tokenId}`}
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
                        loading="lazy"
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
      </div>
    </div>
  )
}
