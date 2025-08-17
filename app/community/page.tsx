"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, TrendingUp, Users, Activity } from "lucide-react"
import Image from "next/image"

interface LeaderboardEntry {
  rank: number
  address: string
  displayName: string
  nftCount: number
  tier: string
  avatar: string
  totalValue: number
}

interface ActivityEntry {
  id: string
  type: "mint" | "trade" | "tier_upgrade"
  user: string
  details: string
  timestamp: string
  value?: number
}

export default function CommunityPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Community page loading data...")

    // Mock data - replace with real API calls
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        address: "0x1234...5678",
        displayName: "PrimeMate #1",
        nftCount: 25,
        tier: "Champion",
        avatar: "/placeholder.svg?height=40&width=40",
        totalValue: 1.25,
      },
      {
        rank: 2,
        address: "0x2345...6789",
        displayName: "BoardMaster",
        nftCount: 18,
        tier: "Champion",
        avatar: "/placeholder.svg?height=40&width=40",
        totalValue: 0.9,
      },
      {
        rank: 3,
        address: "0x3456...7890",
        displayName: "SkateKing",
        nftCount: 12,
        tier: "Pro",
        avatar: "/placeholder.svg?height=40&width=40",
        totalValue: 0.6,
      },
      {
        rank: 4,
        address: "0x4567...8901",
        displayName: "GromCollector",
        nftCount: 8,
        tier: "Amateur",
        avatar: "/placeholder.svg?height=40&width=40",
        totalValue: 0.4,
      },
      {
        rank: 5,
        address: "0x5678...9012",
        displayName: "NewRider",
        nftCount: 5,
        tier: "Grom",
        avatar: "/placeholder.svg?height=40&width=40",
        totalValue: 0.25,
      },
    ]

    const mockActivity: ActivityEntry[] = [
      {
        id: "1",
        type: "mint",
        user: "PrimeMate #1",
        details: "Minted 3 PMBC NFTs",
        timestamp: "2 minutes ago",
        value: 0.15,
      },
      {
        id: "2",
        type: "tier_upgrade",
        user: "BoardMaster",
        details: "Upgraded to Champion tier",
        timestamp: "15 minutes ago",
      },
      {
        id: "3",
        type: "trade",
        user: "SkateKing",
        details: "Purchased PMBC #1337",
        timestamp: "1 hour ago",
        value: 0.08,
      },
      {
        id: "4",
        type: "mint",
        user: "GromCollector",
        details: "Minted 2 PMBC NFTs",
        timestamp: "3 hours ago",
        value: 0.1,
      },
      {
        id: "5",
        type: "tier_upgrade",
        user: "NewRider",
        details: "Upgraded to Grom tier",
        timestamp: "6 hours ago",
      },
    ]

    console.log("[v0] Setting mock data...")
    setLeaderboard(mockLeaderboard)
    setActivity(mockActivity)
    setLoading(false)
    console.log("[v0] Data loaded successfully")
  }, [])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Champion":
        return "bg-yellow-500 text-black"
      case "Pro":
        return "bg-purple-500 text-white"
      case "Amateur":
        return "bg-blue-500 text-white"
      case "Grom":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mint":
        return "🎨"
      case "trade":
        return "💰"
      case "tier_upgrade":
        return "⬆️"
      default:
        return "📝"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-yellow-400 mb-4">PMBC Community</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect with fellow Prime Mates, track leaderboards, and stay updated with community activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1,247</div>
              <div className="text-sm text-gray-400">Total Holders</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">156</div>
              <div className="text-sm text-gray-400">Champions</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">2.4 ETH</div>
              <div className="text-sm text-gray-400">Floor Price</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">89</div>
              <div className="text-sm text-gray-400">24h Activity</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-yellow-400/20">
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              🏆 Leaderboard
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              📈 Activity Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-8">
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Top Collectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading leaderboard...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No leaderboard data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.rank}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-400/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-yellow-400 w-8">#{entry.rank}</div>
                          <Image
                            src={entry.avatar || "/placeholder.svg"}
                            alt={entry.displayName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <div className="font-semibold text-white">{entry.displayName}</div>
                            <div className="text-sm text-gray-400">{entry.address}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getTierColor(entry.tier)}>{entry.tier}</Badge>
                          <div className="text-right">
                            <div className="font-semibold text-white">{entry.nftCount} NFTs</div>
                            <div className="text-sm text-gray-400">{entry.totalValue} ETH</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-8">
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading activity...</p>
                  </div>
                ) : activity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No activity data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-400/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{getActivityIcon(entry.type)}</div>
                          <div>
                            <div className="font-semibold text-white">{entry.user}</div>
                            <div className="text-sm text-gray-400">{entry.details}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.value && <div className="font-semibold text-yellow-400">{entry.value} ETH</div>}
                          <div className="text-sm text-gray-400">{entry.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
