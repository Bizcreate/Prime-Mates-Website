"use client"

import { useState, useEffect } from "react"
import { Search, Users, Wallet, MessageCircle, Hash, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: string
  username: string
  avatar?: string
  walletAddress?: string
  telegramId?: string
  discordId?: string
  nftCount: number
  stakingRewards: number
  joinDate: string
  lastActive: string
  status: "active" | "inactive" | "banned"
  platform: "telegram" | "wallet" | "discord" | "twitter"
}

const mockUsers: User[] = [
  {
    id: "1",
    username: "CryptoApe123",
    avatar: "/placeholder-40x40.png",
    walletAddress: "0x1234...5678",
    telegramId: "@cryptoape123",
    nftCount: 5,
    stakingRewards: 125.5,
    joinDate: "2024-01-15",
    lastActive: "2024-03-01",
    status: "active",
    platform: "telegram",
  },
  {
    id: "2",
    username: "NFTCollector",
    avatar: "/placeholder-40x40.png",
    walletAddress: "0x9876...4321",
    discordId: "NFTCollector#1234",
    nftCount: 12,
    stakingRewards: 340.2,
    joinDate: "2024-02-01",
    lastActive: "2024-03-02",
    status: "active",
    platform: "wallet",
  },
  {
    id: "3",
    username: "PrimeMate",
    avatar: "/placeholder-40x40.png",
    walletAddress: "0x5555...7777",
    telegramId: "@primemate",
    nftCount: 8,
    stakingRewards: 89.7,
    joinDate: "2024-01-20",
    lastActive: "2024-02-28",
    status: "inactive",
    platform: "discord",
  },
]

export default function UserManagementPanel() {
  const [activeTab, setActiveTab] = useState("telegram")
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers)

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telegramId?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTab = activeTab === "all" || user.platform === activeTab
      return matchesSearch && matchesTab
    })
    setFilteredUsers(filtered)
  }, [searchTerm, activeTab, users])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-yellow-500"
      case "banned":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "telegram":
        return <MessageCircle className="h-4 w-4" />
      case "wallet":
        return <Wallet className="h-4 w-4" />
      case "discord":
        return <Hash className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">User Management Panel</h1>
          <p className="text-muted-foreground">Manage Prime Mates community members across all platforms</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 bg-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by username, wallet address, or platform ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-primary/20"
                />
              </div>
              <Button variant="outline" size="sm" className="border-primary/20 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 bg-card border border-primary/20">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All Users
            </TabsTrigger>
            <TabsTrigger
              value="telegram"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Telegram
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Wallet
            </TabsTrigger>
            <TabsTrigger
              value="discord"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Discord
            </TabsTrigger>
            <TabsTrigger
              value="twitter"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Twitter
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">{user.username}</h3>
                        <div className="flex items-center space-x-1">
                          {getPlatformIcon(user.platform)}
                          <Badge variant="outline" className="text-xs">
                            {user.platform}
                          </Badge>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        {user.walletAddress && (
                          <div className="flex items-center space-x-2">
                            <Wallet className="h-3 w-3" />
                            <span className="font-mono">{user.walletAddress}</span>
                          </div>
                        )}
                        {user.telegramId && (
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-3 w-3" />
                            <span>{user.telegramId}</span>
                          </div>
                        )}
                        {user.discordId && (
                          <div className="flex items-center space-x-2">
                            <Hash className="h-3 w-3" />
                            <span>{user.discordId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{user.nftCount}</div>
                      <div className="text-xs text-muted-foreground">NFTs</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{user.stakingRewards}</div>
                      <div className="text-xs text-muted-foreground">PMBC Rewards</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground">{user.joinDate}</div>
                      <div className="text-xs text-muted-foreground">Joined</div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 hover:border-primary bg-transparent"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 hover:border-primary bg-transparent"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="bg-card border-primary/20">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
