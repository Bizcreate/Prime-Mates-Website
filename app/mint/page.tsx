"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Plus, Minus, ExternalLink, Users, Clock, Zap, Gift, Star, Trophy } from "lucide-react"
import { useWallet, WalletConnectButton } from "@/contexts/unified-wallet-context"

const CONTRACT_ADDRESS = "0x12662b6a2a424a0090b7d09401fb775a9b968898"

export default function MintPage() {
  const { address: walletAddress, isConnected } = useWallet()
  const [mintQuantity, setMintQuantity] = useState(1)
  const [isMinting, setIsMinting] = useState(false)
  const [totalSupply, setTotalSupply] = useState(1661)
  const [maxSupply, setMaxSupply] = useState(2222)
  const [mintPrice, setMintPrice] = useState(0.05)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  useEffect(() => {
    loadCollectionStats()
  }, [])

  const loadCollectionStats = async () => {
    setIsLoadingStats(true)
    try {
      console.log("[v0] Loading collection stats...")
      // For now, keep default values - can be enhanced later with real blockchain calls
    } catch (error) {
      console.error("Failed to load collection stats:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const mintNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    try {
      console.log("[v0] Starting mint process for", mintQuantity, "NFTs")
      console.log("[v0] Connected wallet:", walletAddress)

      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate minting delay

      toast({
        title: "Minting Successful!",
        description: (
          <div>
            <p>
              Successfully minted {mintQuantity} Prime Mates NFT{mintQuantity > 1 ? "s" : ""}!
            </p>
            <p className="text-sm text-gray-400 mt-1">Transaction will appear in your wallet shortly</p>
          </div>
        ),
      })

      // Refresh collection stats after successful mint
      await loadCollectionStats()
    } catch (error: any) {
      console.error("Minting error:", error)
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  const adjustQuantity = (change: number) => {
    const newQuantity = mintQuantity + change
    if (newQuantity >= 1 && newQuantity <= 10) {
      setMintQuantity(newQuantity)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdc730]/5 via-transparent to-[#fdc730]/5 animate-pulse" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#fdc730] text-black hover:bg-[#fdc730]/90 shadow-lg shadow-[#fdc730]/20">
              Prime Mates Board Club
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#fdc730] to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
              Art Collection
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join the club and get exclusive access to products, utilities, and games. Hold multiple for bonus rewards!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* NFT Preview */}
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-[#fdc730]/20 to-yellow-600/20 rounded-lg mb-4 flex items-center justify-center border-2 border-[#fdc730]/30 shadow-lg shadow-[#fdc730]/10">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pmbc1.GIF-2YlHT4ki8pFi2FuczRbVv9KvZrgEG2.gif"
                      alt="Prime Mates NFT Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-[#fdc730]">
                        Prime Mates #{(totalSupply + Math.floor(Math.random() * 100)).toString().padStart(4, "0")}
                      </h3>
                      <p className="text-gray-400">Board Club Member</p>
                    </div>
                    <Badge variant="outline" className="border-[#fdc730] text-[#fdc730] shadow-sm shadow-[#fdc730]/20">
                      Exclusive
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Collection Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-900/30 border-gray-800 border-t-2 border-t-[#fdc730]">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 text-[#fdc730] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#fdc730]">
                      {isLoadingStats ? "..." : totalSupply.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Minted</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/30 border-gray-800 border-t-2 border-t-[#fdc730]">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 text-[#fdc730] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#fdc730]">{maxSupply.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Supply</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/30 border-gray-800 border-t-2 border-t-[#fdc730]">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-6 h-6 text-[#fdc730] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-[#fdc730]">
                      {isLoadingStats ? "..." : `${mintPrice} ETH`}
                    </div>
                    <div className="text-sm text-gray-400">Mint Price</div>
                  </CardContent>
                </Card>
              </div>

              {/* Minting Progress */}
              <Card className="bg-gray-900/30 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#fdc730]">Minting Progress</span>
                    <span className="text-sm text-[#fdc730] font-bold">
                      {Math.round((totalSupply / maxSupply) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#fdc730] to-yellow-400 h-2 rounded-full transition-all duration-300 shadow-sm shadow-[#fdc730]/30"
                      style={{ width: `${(totalSupply / maxSupply) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{maxSupply - totalSupply} NFTs remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Minting Interface */}
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm border-l-4 border-l-[#fdc730]">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#fdc730]">Mint Your Prime Mates</CardTitle>
                  <CardDescription>Connect your wallet and join the exclusive Board Club</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Wallet Connection */}
                  {!isConnected ? (
                    <div className="space-y-3">
                      <WalletConnectButton className="w-full py-3 text-lg" />
                      <div className="p-3 bg-[#fdc730]/10 border border-[#fdc730]/30 rounded-lg">
                        <p className="text-sm text-[#fdc730] text-center">
                          💡 When your wallet popup appears, click <strong>"Connect"</strong> or{" "}
                          <strong>"Approve"</strong> to proceed
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Connected Wallet</p>
                          <p className="font-mono text-green-400">
                            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                          </p>
                        </div>
                        <Badge className="bg-green-900 text-green-300">Connected</Badge>
                      </div>
                    </div>
                  )}

                  <Separator className="bg-gray-800" />

                  {/* Quantity Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-[#fdc730]">Quantity (Max 10)</Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(-1)}
                        disabled={mintQuantity <= 1}
                        className="border-gray-700 hover:bg-[#fdc730]/10 hover:border-[#fdc730]"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={mintQuantity}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value)
                          if (val >= 1 && val <= 10) setMintQuantity(val)
                        }}
                        className="w-20 text-center bg-gray-900 border-gray-700 focus:border-[#fdc730] text-[#fdc730] font-bold"
                        min="1"
                        max="10"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(1)}
                        disabled={mintQuantity >= 10}
                        className="border-gray-700 hover:bg-[#fdc730]/10 hover:border-[#fdc730]"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Price Calculation */}
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-[#fdc730]/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Price per NFT</span>
                      <span className="font-semibold text-[#fdc730]">{mintPrice} ETH</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Quantity</span>
                      <span className="font-semibold text-[#fdc730]">{mintQuantity}</span>
                    </div>
                    <Separator className="bg-gray-700 my-2" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#fdc730] text-xl">{(mintPrice * mintQuantity).toFixed(3)} ETH</span>
                    </div>
                  </div>

                  {/* Mint Button */}
                  <Button
                    onClick={mintNFT}
                    disabled={!isConnected || isMinting}
                    className="w-full bg-[#fdc730] hover:bg-[#fdc730]/90 text-black font-semibold py-3 shadow-lg shadow-[#fdc730]/30 hover:shadow-[#fdc730]/40 transition-all duration-200"
                    size="lg"
                  >
                    {isMinting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2" />
                        Minting...
                      </>
                    ) : (
                      `Mint ${mintQuantity} NFT${mintQuantity > 1 ? "s" : ""}`
                    )}
                  </Button>

                  {/* Contract Info */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-400 mb-2">Contract Address</p>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="text-xs bg-gray-900 px-2 py-1 rounded font-mono border border-[#fdc730]/20">
                        {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://etherscan.io/address/${CONTRACT_ADDRESS}`, "_blank")}
                        className="hover:bg-[#fdc730]/10"
                      >
                        <ExternalLink className="w-4 h-4 text-[#fdc730]" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#fdc730] to-yellow-300 bg-clip-text text-transparent">
            Prime Mates Board Club Benefits
          </h2>
          <p className="text-xl text-gray-400">Exclusive perks for NFT holders</p>
        </div>

        {/* PMBC Mint Out Bonus section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-[#fdc730]/20 via-yellow-600/10 to-[#fdc730]/20 border-[#fdc730] shadow-2xl shadow-[#fdc730]/20">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-[#fdc730] text-black text-lg px-4 py-2 font-bold">🎉 MINT OUT BONUS</Badge>
                <h3 className="text-3xl font-bold text-[#fdc730] mb-4">$50,000 Reward Pool</h3>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Once the collection is fully minted, all PMBC holders will share in a massive $50,000 bonus pool based
                  on their tier level!
                </p>
              </div>

              {/* PMBC Tier System */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🥉</div>
                    <h4 className="font-bold text-[#fdc730] mb-2">Holder</h4>
                    <p className="text-sm text-gray-400 mb-2">1-2 NFTs</p>
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      0% Share
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-green-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🏄‍♂️</div>
                    <h4 className="font-bold text-green-400 mb-2">Grom</h4>
                    <p className="text-sm text-gray-400 mb-2">3-5 NFTs</p>
                    <Badge variant="outline" className="bg-green-900 text-green-300">
                      10% Share
                    </Badge>
                    <p className="text-xs text-green-400 mt-1">+ Free Skateboard</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-blue-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🛹</div>
                    <h4 className="font-bold text-blue-400 mb-2">Amateur</h4>
                    <p className="text-sm text-gray-400 mb-2">6-9 NFTs</p>
                    <Badge variant="outline" className="bg-blue-900 text-blue-300">
                      20% Share
                    </Badge>
                    <p className="text-xs text-blue-400 mt-1">+ Free Skateboard</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-purple-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🏆</div>
                    <h4 className="font-bold text-purple-400 mb-2">Pro</h4>
                    <p className="text-sm text-gray-400 mb-2">10-15 NFTs</p>
                    <Badge variant="outline" className="bg-purple-900 text-purple-300">
                      30% Share
                    </Badge>
                    <p className="text-xs text-purple-400 mt-1">+ Free Skateboard</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-[#fdc730]">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">👑</div>
                    <h4 className="font-bold text-[#fdc730] mb-2">Champion</h4>
                    <p className="text-sm text-gray-400 mb-2">16+ NFTs</p>
                    <Badge className="bg-[#fdc730] text-black">40% Share</Badge>
                    <p className="text-xs text-[#fdc730] mt-1">+ Free Skateboard</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  Members in each tier will share the allocated amount equally. The more NFTs you hold, the higher your
                  tier and reward!
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-700">
                    <div className="font-bold text-green-400">Grom Tier</div>
                    <div className="text-green-300">$5,000 Pool</div>
                  </div>
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700">
                    <div className="font-bold text-blue-400">Amateur Tier</div>
                    <div className="text-blue-300">$10,000 Pool</div>
                  </div>
                  <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700">
                    <div className="font-bold text-purple-400">Pro Tier</div>
                    <div className="text-purple-300">$15,000 Pool</div>
                  </div>
                  <div className="p-3 bg-[#fdc730]/20 rounded-lg border border-[#fdc730]">
                    <div className="font-bold text-[#fdc730]">Champion Tier</div>
                    <div className="text-[#fdc730]">$20,000 Pool</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Limited Mint Bounties section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-700 shadow-lg shadow-red-700/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-red-400 mb-4">🎁 Limited Mint Bounties</h3>
              <p className="text-lg text-gray-300 mb-4">
                <span className="text-[#fdc730] font-bold">Mint 2 NFTs</span> and receive a{" "}
                <span className="text-red-400 font-bold">FREE merch item</span>!
              </p>
              <Badge className="bg-red-900 text-red-300 text-sm px-3 py-1">Limited Time Offer</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Updated Benefits Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/30 border-gray-800 hover:border-[#fdc730]/50 transition-colors duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-[#fdc730]/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#fdc730]/30">
                <Gift className="w-8 h-8 text-[#fdc730]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#fdc730]">Exclusive Products</h3>
              <p className="text-gray-400 text-sm">Access to limited edition merchandise and skateboard decks</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/30 border-gray-800 hover:border-[#fdc730]/50 transition-colors duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-[#fdc730]/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#fdc730]/30">
                <Zap className="w-8 h-8 text-[#fdc730]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#fdc730]">Utilities & Games</h3>
              <p className="text-gray-400 text-sm">Special access to Prime Arcade and exclusive gaming features</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/30 border-gray-800 hover:border-[#fdc730]/50 transition-colors duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-[#fdc730]/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#fdc730]/30">
                <Star className="w-8 h-8 text-[#fdc730]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#fdc730]">Bonus Rewards</h3>
              <p className="text-gray-400 text-sm">Hold multiple NFTs for enhanced rewards and benefits</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/30 border-gray-800 hover:border-[#fdc730]/50 transition-colors duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-[#fdc730]/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#fdc730]/30">
                <Trophy className="w-8 h-8 text-[#fdc730]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#fdc730]">Elite Community</h3>
              <p className="text-gray-400 text-sm">Join the most exclusive skateboarding club in web3</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card className="bg-gradient-to-r from-[#fdc730]/10 to-yellow-600/10 border-[#fdc730]/30 shadow-lg shadow-[#fdc730]/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-[#fdc730] mb-4">🛹 Skateboard Rewards</h3>
              <p className="text-lg text-gray-300 mb-6">
                All holders at Grom tier and above receive a physical skateboard at mint out! Plus, claim exclusive
                tier-specific skateboard designs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-green-900/20 rounded-lg border border-green-700">
                  <div className="font-bold text-green-400">Grom (3-5)</div>
                  <div className="text-green-300">Basic Skateboard</div>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700">
                  <div className="font-bold text-blue-400">Amateur (6-9)</div>
                  <div className="text-blue-300">Pro Skateboard</div>
                </div>
                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700">
                  <div className="font-bold text-purple-400">Pro (10-15)</div>
                  <div className="text-purple-300">Elite Skateboard</div>
                </div>
                <div className="p-3 bg-[#fdc730]/20 rounded-lg border border-[#fdc730]">
                  <div className="font-bold text-[#fdc730]">Champion (16+)</div>
                  <div className="text-[#fdc730]">Legendary Skateboard</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
