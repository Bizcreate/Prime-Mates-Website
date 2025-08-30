"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTokens } from "@/contexts/token-context"
import { Coins, TrendingUp, Star, ShoppingCart, History, RefreshCw, Trophy, Zap } from "lucide-react"

export function TokenManagement() {
  const {
    shakaBalance,
    grindBalance,
    transactions,
    activities,
    redemptions,
    isLoading,
    earnTokens,
    spendTokens,
    getTransactionHistory,
    refreshBalances,
    getTotalEarned,
    getTotalSpent,
  } = useTokens()

  const [activeTab, setActiveTab] = useState("overview")

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getActivityCooldownStatus = (activity: any) => {
    if (!activity.lastCompleted) return { isAvailable: true, timeLeft: 0 }

    const cooldownEnd = new Date(activity.lastCompleted.getTime() + activity.cooldown * 60 * 60 * 1000)
    const now = new Date()
    const timeLeft = Math.max(0, cooldownEnd.getTime() - now.getTime())

    return {
      isAvailable: timeLeft === 0,
      timeLeft: Math.ceil(timeLeft / (1000 * 60 * 60)), // hours
    }
  }

  return (
    <div className="space-y-6">
      {/* Token Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-orange-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center">
              <Coins className="h-4 w-4 mr-2 text-orange-400" />
              $SHAKA Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{shakaBalance.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              Earned: {getTotalEarned("SHAKA").toLocaleString()} | Spent: {getTotalSpent("SHAKA").toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-purple-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-purple-400" />
              $GRIND Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{grindBalance.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              Earned: {getTotalEarned("GRIND").toLocaleString()} | Spent: {getTotalSpent("GRIND").toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-green-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {(getTotalEarned("SHAKA") + getTotalEarned("GRIND")).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All-time earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-blue-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center">
              <History className="h-4 w-4 mr-2 text-blue-400" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{transactions.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border border-yellow-400/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Overview
          </TabsTrigger>
          <TabsTrigger value="earn" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Earn Tokens
          </TabsTrigger>
          <TabsTrigger value="redeem" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Redeem Rewards
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center justify-between">
                <span>Token Portfolio Overview</span>
                <Button
                  onClick={refreshBalances}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="border-yellow-400/50 bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-400">$SHAKA Token</h3>
                  <p className="text-gray-400 text-sm">
                    Primary utility token for merchandise, exclusive access, and community rewards.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Balance:</span>
                      <span className="text-orange-400 font-semibold">{shakaBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Earned:</span>
                      <span className="text-green-400">{getTotalEarned("SHAKA").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Spent:</span>
                      <span className="text-red-400">{getTotalSpent("SHAKA").toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">$GRIND Token</h3>
                  <p className="text-gray-400 text-sm">
                    Premium token for exclusive NFTs, custom services, and high-tier rewards.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Balance:</span>
                      <span className="text-purple-400 font-semibold">{grindBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Earned:</span>
                      <span className="text-green-400">{getTotalEarned("GRIND").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Spent:</span>
                      <span className="text-red-400">{getTotalSpent("GRIND").toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "earned"
                              ? "bg-green-500/20"
                              : transaction.type === "bonus"
                                ? "bg-blue-500/20"
                                : "bg-red-500/20"
                          }`}
                        >
                          {transaction.type === "earned" ? (
                            <TrendingUp className="h-4 w-4 text-green-400" />
                          ) : transaction.type === "bonus" ? (
                            <Star className="h-4 w-4 text-blue-400" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{transaction.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(transaction.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            transaction.type === "spent" ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {transaction.type === "spent" ? "-" : "+"}
                          {transaction.amount} {transaction.tokenType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earn" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Earn Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((activity) => {
                  const cooldownStatus = getActivityCooldownStatus(activity)
                  return (
                    <Card key={activity.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white mb-1">{activity.name}</h3>
                            <p className="text-sm text-gray-400">{activity.description}</p>
                          </div>
                          <Trophy className="h-5 w-5 text-yellow-400" />
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">SHAKA Reward:</span>
                            <span className="text-orange-400 font-semibold">+{activity.shakaReward}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">GRIND Reward:</span>
                            <span className="text-purple-400 font-semibold">+{activity.grindReward}</span>
                          </div>
                          {activity.cooldown > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Cooldown:</span>
                              <span className="text-blue-400 text-sm">{activity.cooldown}h</span>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => earnTokens(activity.id)}
                          disabled={isLoading || !cooldownStatus.isAvailable}
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                        >
                          {isLoading
                            ? "Processing..."
                            : !cooldownStatus.isAvailable
                              ? `Available in ${cooldownStatus.timeLeft}h`
                              : "Complete Activity"}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redeem" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Redeem Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {redemptions.map((redemption) => {
                  const canAfford = shakaBalance >= redemption.shakaCost && grindBalance >= redemption.grindCost
                  return (
                    <Card key={redemption.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white mb-1">{redemption.name}</h3>
                            <p className="text-sm text-gray-400">{redemption.description}</p>
                          </div>
                          <Badge
                            className={`${
                              redemption.category === "merch"
                                ? "bg-orange-500"
                                : redemption.category === "access"
                                  ? "bg-blue-500"
                                  : redemption.category === "nft"
                                    ? "bg-purple-500"
                                    : "bg-green-500"
                            }`}
                          >
                            {redemption.category}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          {redemption.shakaCost > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">SHAKA Cost:</span>
                              <span className="text-orange-400 font-semibold">{redemption.shakaCost}</span>
                            </div>
                          )}
                          {redemption.grindCost > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">GRIND Cost:</span>
                              <span className="text-purple-400 font-semibold">{redemption.grindCost}</span>
                            </div>
                          )}
                          {redemption.stock && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Stock:</span>
                              <span className="text-blue-400 text-sm">{redemption.stock} left</span>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => spendTokens(redemption.id)}
                          disabled={isLoading || !canAfford || !redemption.isAvailable}
                          className={`w-full font-semibold ${
                            canAfford
                              ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                              : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {isLoading
                            ? "Processing..."
                            : !canAfford
                              ? "Insufficient Balance"
                              : !redemption.isAvailable
                                ? "Out of Stock"
                                : "Redeem"}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full ${
                          transaction.type === "earned"
                            ? "bg-green-500/20"
                            : transaction.type === "bonus"
                              ? "bg-blue-500/20"
                              : "bg-red-500/20"
                        }`}
                      >
                        {transaction.type === "earned" ? (
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        ) : transaction.type === "bonus" ? (
                          <Star className="h-5 w-5 text-blue-400" />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-400">{formatDate(transaction.timestamp)}</p>
                        {transaction.source && <p className="text-xs text-blue-400">Source: {transaction.source}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "spent" ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {transaction.type === "spent" ? "-" : "+"}
                        {transaction.amount}
                      </p>
                      <p
                        className={`text-sm ${
                          transaction.tokenType === "SHAKA" ? "text-orange-400" : "text-purple-400"
                        }`}
                      >
                        {transaction.tokenType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
