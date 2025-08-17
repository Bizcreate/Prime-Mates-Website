"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Wallet, Plus, Minus, ExternalLink, Users, Clock, Zap, Gift, Star, Trophy } from "lucide-react"

const CONTRACT_ADDRESS = "0x12662b6a2a424a0090b7d09401fb775a9b968898"

export default function MintPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [mintQuantity, setMintQuantity] = useState(1)
  const [isMinting, setIsMinting] = useState(false)
  const [totalSupply, setTotalSupply] = useState(1661)
  const [maxSupply] = useState(2222)
  const [mintPrice] = useState(0.05)

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        setWalletAddress(accounts[0])
        setIsConnected(true)
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to mint NFTs",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
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
      // Simulate minting process
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setTotalSupply((prev) => prev + mintQuantity)
      toast({
        title: "Minting Successful!",
        description: `Successfully minted ${mintQuantity} Prime Mates NFT${mintQuantity > 1 ? "s" : ""}`,
      })
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: "Failed to mint NFT. Please try again.",
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
                        Prime Mates #{(1661 + Math.floor(Math.random() * 100)).toString().padStart(4, "0")}
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
                    <div className="text-2xl font-bold text-[#fdc730]">{totalSupply.toLocaleString()}</div>
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
                    <div className="text-2xl font-bold text-[#fdc730]">{mintPrice} ETH</div>
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
                    <Button
                      onClick={connectWallet}
                      className="w-full bg-[#fdc730] hover:bg-[#fdc730]/90 text-black font-semibold py-3 shadow-lg shadow-[#fdc730]/20"
                      size="lg"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet
                    </Button>
                  ) : (
                    <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Connected Wallet</p>
                          <p className="font-mono text-green-400">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
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

        {/* Holder Benefits Callout */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-[#fdc730]/10 to-yellow-600/10 border-[#fdc730]/30 shadow-lg shadow-[#fdc730]/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-[#fdc730] mb-4">Multi-Holder Bonus</h3>
              <p className="text-lg text-gray-300 mb-6">
                The more Prime Mates you hold, the greater your rewards! Unlock exclusive tiers and enhanced benefits.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-900/50 rounded-lg border border-[#fdc730]/20">
                  <div className="font-bold text-[#fdc730]">1-2 NFTs</div>
                  <div className="text-gray-400">Basic Club Access</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg border border-[#fdc730]/20">
                  <div className="font-bold text-[#fdc730]">3-5 NFTs</div>
                  <div className="text-gray-400">Enhanced Rewards</div>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg border border-[#fdc730]/20">
                  <div className="font-bold text-[#fdc730]">6+ NFTs</div>
                  <div className="text-gray-400">VIP Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
