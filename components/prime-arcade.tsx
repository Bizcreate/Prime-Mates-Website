"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Coins, Trophy, Users, ExternalLink, Gamepad2, Wallet, Shield, Zap, Star, Gift } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

// PMBC Contract Address
const PMBC_CONTRACT_ADDRESS = "0x12662b6a2a424a0090b7d09401fb775a9b968898"

export function PrimeArcade() {
  const [account, setAccount] = useState<string | null>(null)
  const [nftBalance, setNftBalance] = useState<number>(0)
  const [isHolder, setIsHolder] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const arcadeFeatures = [
    {
      icon: Coins,
      title: "Play to Earn",
      description: "Earn Shaka tokens by playing games and completing challenges",
    },
    {
      icon: Trophy,
      title: "Competitions",
      description: "Join tournaments and compete for massive Shaka token prizes",
    },
    {
      icon: Gamepad2,
      title: "Multiple Games",
      description: "Access a variety of games all in one arcade platform",
    },
    {
      icon: Users,
      title: "Community Rewards",
      description: "Bonus rewards for PMBC NFT holders and community members",
    },
  ]

  const stats = [
    { value: "50K+", label: "Active Players" },
    { value: "1M+", label: "Shaka Earned" },
    { value: "25+", label: "Games Available" },
    { value: "500+", label: "Daily Tournaments" },
  ]

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to continue.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const accounts: string[] = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        await checkNFTBalance(accounts[0])
        toast({
          title: "Wallet connected",
          description: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      }
    } catch (err: any) {
      toast({
        title: "Failed to connect",
        description:
          err?.message === "User rejected the request."
            ? "Connection request was rejected."
            : "Could not connect to MetaMask.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkNFTBalance = async (address: string) => {
    try {
      if (!(window as any).ethereum) return

      // Create contract instance
      const web3 = new (window as any).Web3((window as any).ethereum)
      const contract = new web3.eth.Contract(
        [
          {
            inputs: [{ internalType: "address", name: "owner", type: "address" }],
            name: "balanceOf",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        PMBC_CONTRACT_ADDRESS,
      )

      const balance = await contract.methods.balanceOf(address).call()
      const balanceNum = Number.parseInt(balance)

      setNftBalance(balanceNum)
      setIsHolder(balanceNum > 0)

      if (balanceNum > 0) {
        toast({
          title: "PMBC Holder Verified! 🎉",
          description: `You own ${balanceNum} Prime Mates NFT${balanceNum > 1 ? "s" : ""}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error checking NFT balance",
        description: "Could not verify NFT ownership. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          })
          if (accounts.length > 0) {
            setAccount(accounts[0])
            await checkNFTBalance(accounts[0])
          }
        } catch (error) {
          // Silently fail connection check on page load
        }
      }
    }
    checkConnection()
  }, [])

  return (
    <section id="prime-arcade" className="py-20 bg-black relative">
      {/* Floating Shaka Coins */}
      <div className="absolute inset-0 overflow-hidden opacity-15">
        <img
          src="/golden-coin-with-shaka-hand-symbol.png"
          alt="Shaka Coin"
          className="absolute top-16 left-16 w-24 h-24 animate-pulse"
        />
        <img
          src="/golden-coin-with-shaka-hand-symbol.png"
          alt="Shaka Coin"
          className="absolute top-40 right-12 w-16 h-16 animate-pulse delay-500"
        />
        <img
          src="/golden-coin-with-shaka-hand-symbol.png"
          alt="Shaka Coin"
          className="absolute bottom-20 left-1/3 w-20 h-20 animate-pulse delay-1000"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <img src="/golden-coin-with-shaka-hand-symbol.png" alt="Shaka Coin" className="w-20 h-20 mr-4" />
            <div>
              <h2 className="text-5xl font-black text-yellow-400">PRIME ARCADE</h2>
              <p className="text-xl text-yellow-300">Play to Earn Gaming Platform</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-xl text-gray-300 mb-6">
              Prime Arcade is our revolutionary gaming ecosystem where every game you play earns you real rewards. Built
              on blockchain technology with our native Shaka token economy, it's the ultimate destination for
              play-to-earn gaming.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-900 border-yellow-400/30">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Instant Rewards</h3>
                  <p className="text-gray-400 text-sm">
                    Earn Shaka tokens immediately as you play - no waiting periods
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/30">
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Premium Games</h3>
                  <p className="text-gray-400 text-sm">
                    25+ high-quality games across multiple genres and difficulty levels
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-yellow-400/30">
                <CardContent className="p-6 text-center">
                  <Gift className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">NFT Holder Perks</h3>
                  <p className="text-gray-400 text-sm">
                    PMBC holders get 2x rewards, exclusive tournaments, and early access
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Wallet Connection & NFT Status */}
          <div className="mb-8">
            {!account ? (
              <Button
                size="lg"
                onClick={connectWallet}
                disabled={loading}
                className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 rounded-lg mr-4"
              >
                <Wallet className="mr-2 h-5 w-5" />
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Badge className="bg-green-600 text-white px-4 py-2">
                  <Wallet className="mr-2 h-4 w-4" />
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </Badge>
                {isHolder && (
                  <Badge className="bg-yellow-600 text-black px-4 py-2">
                    <Shield className="mr-2 h-4 w-4" />
                    PMBC Holder ({nftBalance} NFTs)
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 rounded-lg"
              onClick={() => window.open("https://app.primearcade.io/?ref=7432766311", "_blank")}
            >
              <Play className="mr-2 h-5 w-5" />
              Play Now & Earn
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent font-bold px-8 rounded-lg"
            >
              <Coins className="mr-2 h-5 w-5" />
              Learn About Shaka
            </Button>
          </div>
        </div>

        {/* NFT Holder Benefits */}
        {isHolder && (
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 border-0">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <Shield className="h-16 w-16 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-4">PMBC HOLDER EXCLUSIVE</h3>
                <p className="text-black/80 mb-6 max-w-2xl mx-auto">
                  As a verified Prime Mates Board Club NFT holder, you get exclusive benefits including bonus Shaka
                  tokens, special tournaments, and early access to new games!
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="font-bold text-black">2x Shaka Rewards</h4>
                    <p className="text-black/80 text-sm">Double token earnings on all games</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="font-bold text-black">VIP Tournaments</h4>
                    <p className="text-black/80 text-sm">Access to holder-only competitions</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="font-bold text-black">Early Access</h4>
                    <p className="text-black/80 text-sm">First to play new game releases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {arcadeFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-black border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 group"
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <feature.icon className="h-12 w-12 text-yellow-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Shaka Token Economy */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <Card className="bg-black border-yellow-400/50">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Image src="/images/shaka-coin.png" alt="Shaka Coin" width={60} height={60} className="mr-4" />
                <div>
                  <h3 className="text-3xl font-bold text-yellow-400">SHAKA TOKEN</h3>
                  <p className="text-yellow-300">Our Gaming Economy Currency</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Earn by Playing</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tournament Prizes</span>
                  <Badge className="bg-blue-600">Daily</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">NFT Holder Bonuses</span>
                  <Badge className={`${isHolder ? "bg-yellow-600" : "bg-purple-600"}`}>
                    {isHolder ? "Active" : "Exclusive"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Marketplace Trading</span>
                  <Badge className="bg-yellow-600">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">How to Start Earning</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Connect Your Wallet</h4>
                    <p className="text-gray-400">Link your MetaMask to verify PMBC NFT ownership</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Play Games</h4>
                    <p className="text-gray-400">Choose from 25+ games and start earning Shaka</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Earn & Compete</h4>
                    <p className="text-gray-400">
                      Join tournaments for bigger rewards {isHolder && "(2x for holders!)"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Economy Explanation */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-gray-900 to-black border-yellow-400/50">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold text-yellow-400 mb-6 text-center">The Shaka Token Economy</h3>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-white mb-4">Current Phase: $GRIND Token</h4>
                  <p className="text-gray-300 mb-4">
                    We're launching with $GRIND, our in-game utility token that powers the Prime Arcade ecosystem.
                    $GRIND tokens are earned through gameplay and can be used for tournaments, upgrades, and exclusive
                    content.
                  </p>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Earn $GRIND by playing any arcade game</li>
                    <li>• Use $GRIND for tournament entry fees</li>
                    <li>• Purchase in-game upgrades and power-ups</li>
                    <li>• Access exclusive holder-only content</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-white mb-4">Future: $SHAKA Main Token</h4>
                  <p className="text-gray-300 mb-4">
                    $SHAKA will be our main ecosystem token, launching with a strong liquidity pool funded by $GRIND
                    activity. This ensures a solid foundation and sustainable tokenomics for the entire Prime Mates
                    ecosystem.
                  </p>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Main ecosystem governance token</li>
                    <li>• Cross-platform utility across all Prime Mates products</li>
                    <li>• Staking rewards and yield farming</li>
                    <li>• NFT marketplace transactions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-black text-yellow-400 mb-2">{stat.value}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-yellow-400 border-0 inline-block">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-black mb-4">Ready to Start Earning?</h3>
              <p className="text-black/80 mb-6">
                Join thousands of players earning Shaka tokens daily
                {isHolder && " - Get 2x rewards as a PMBC holder!"}
              </p>
              <Button
                size="lg"
                className="bg-black text-yellow-400 hover:bg-gray-900 font-bold px-8 rounded-lg"
                onClick={() => window.open("https://app.primearcade.io/?ref=7432766311", "_blank")}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Launch Prime Arcade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
