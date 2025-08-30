"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useActiveAccount } from "thirdweb/react"
import { useToast } from "@/hooks/use-toast"

interface TokenTransaction {
  id: string
  type: "earned" | "spent" | "bonus"
  tokenType: "SHAKA" | "GRIND"
  amount: number
  description: string
  timestamp: Date
  source?: string
}

interface TokenEarningActivity {
  id: string
  name: string
  description: string
  shakaReward: number
  grindReward: number
  cooldown: number // in hours
  lastCompleted?: Date
  isAvailable: boolean
}

interface TokenRedemption {
  id: string
  name: string
  description: string
  shakaCost: number
  grindCost: number
  category: "merch" | "access" | "nft" | "utility"
  image?: string
  isAvailable: boolean
  stock?: number
}

interface TokenContextType {
  shakaBalance: number
  grindBalance: number
  transactions: TokenTransaction[]
  activities: TokenEarningActivity[]
  redemptions: TokenRedemption[]
  isLoading: boolean
  earnTokens: (activityId: string) => Promise<void>
  spendTokens: (redemptionId: string) => Promise<void>
  getTransactionHistory: (tokenType?: "SHAKA" | "GRIND") => TokenTransaction[]
  refreshBalances: () => Promise<void>
  getTotalEarned: (tokenType: "SHAKA" | "GRIND") => number
  getTotalSpent: (tokenType: "SHAKA" | "GRIND") => number
}

const TokenContext = createContext<TokenContextType | undefined>(undefined)

export function TokenProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount()
  const { toast } = useToast()
  const [shakaBalance, setShakaBalance] = useState(0)
  const [grindBalance, setGrindBalance] = useState(0)
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock earning activities
  const [activities] = useState<TokenEarningActivity[]>([
    {
      id: "daily-login",
      name: "Daily Login",
      description: "Log in to your dashboard daily",
      shakaReward: 10,
      grindReward: 5,
      cooldown: 24,
      isAvailable: true,
    },
    {
      id: "stake-nft",
      name: "Stake NFT",
      description: "Stake a Prime Mates NFT for 24 hours",
      shakaReward: 50,
      grindReward: 25,
      cooldown: 0,
      isAvailable: true,
    },
    {
      id: "community-engagement",
      name: "Community Engagement",
      description: "Participate in Discord discussions",
      shakaReward: 25,
      grindReward: 15,
      cooldown: 12,
      isAvailable: true,
    },
    {
      id: "referral-bonus",
      name: "Referral Bonus",
      description: "Refer a new member to PMBC",
      shakaReward: 200,
      grindReward: 100,
      cooldown: 0,
      isAvailable: true,
    },
    {
      id: "weekly-challenge",
      name: "Weekly Challenge",
      description: "Complete weekly community challenges",
      shakaReward: 100,
      grindReward: 75,
      cooldown: 168, // 1 week
      isAvailable: true,
    },
  ])

  // Mock redemption options
  const [redemptions] = useState<TokenRedemption[]>([
    {
      id: "pmbc-hoodie",
      name: "PMBC Hoodie",
      description: "Exclusive Prime Mates hoodie with custom design",
      shakaCost: 500,
      grindCost: 0,
      category: "merch",
      isAvailable: true,
      stock: 25,
    },
    {
      id: "sticker-pack",
      name: "Sticker Pack",
      description: "Set of 10 Prime Mates stickers",
      shakaCost: 100,
      grindCost: 0,
      category: "merch",
      isAvailable: true,
      stock: 100,
    },
    {
      id: "discord-role",
      name: "VIP Discord Role",
      description: "Exclusive VIP role in Discord with special perks",
      shakaCost: 0,
      grindCost: 200,
      category: "access",
      isAvailable: true,
    },
    {
      id: "early-access",
      name: "Early Access Pass",
      description: "Early access to new drops and features",
      shakaCost: 300,
      grindCost: 150,
      category: "access",
      isAvailable: true,
      stock: 50,
    },
    {
      id: "custom-pfp",
      name: "Custom PFP Creation",
      description: "Get a custom profile picture created by the team",
      shakaCost: 0,
      grindCost: 500,
      category: "nft",
      isAvailable: true,
      stock: 10,
    },
    {
      id: "gas-refund",
      name: "Gas Fee Refund",
      description: "Get your next transaction gas fees refunded",
      shakaCost: 150,
      grindCost: 100,
      category: "utility",
      isAvailable: true,
      stock: 20,
    },
  ])

  useEffect(() => {
    if (account?.address) {
      loadTokenBalances()
      loadTransactionHistory()
    }
  }, [account?.address])

  const loadTokenBalances = async () => {
    try {
      // In a real implementation, this would fetch from blockchain or API
      setShakaBalance(1250)
      setGrindBalance(890)
    } catch (error) {
      console.error("Error loading token balances:", error)
    }
  }

  const loadTransactionHistory = async () => {
    try {
      // Mock transaction history
      const mockTransactions: TokenTransaction[] = [
        {
          id: "1",
          type: "earned",
          tokenType: "SHAKA",
          amount: 50,
          description: "Daily login bonus",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          source: "daily-login",
        },
        {
          id: "2",
          type: "earned",
          tokenType: "GRIND",
          amount: 25,
          description: "NFT staking reward",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          source: "stake-nft",
        },
        {
          id: "3",
          type: "spent",
          tokenType: "SHAKA",
          amount: 100,
          description: "Purchased sticker pack",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: "4",
          type: "bonus",
          tokenType: "SHAKA",
          amount: 200,
          description: "Referral bonus",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          source: "referral-bonus",
        },
        {
          id: "5",
          type: "earned",
          tokenType: "GRIND",
          amount: 75,
          description: "Weekly challenge completed",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          source: "weekly-challenge",
        },
      ]
      setTransactions(mockTransactions)
    } catch (error) {
      console.error("Error loading transaction history:", error)
    }
  }

  const earnTokens = async (activityId: string) => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newTransaction: TokenTransaction = {
        id: `earn-${Date.now()}`,
        type: "earned",
        tokenType: "SHAKA",
        amount: activity.shakaReward,
        description: activity.name,
        timestamp: new Date(),
        source: activityId,
      }

      setTransactions((prev) => [newTransaction, ...prev])
      setShakaBalance((prev) => prev + activity.shakaReward)
      setGrindBalance((prev) => prev + activity.grindReward)

      if (activity.grindReward > 0) {
        const grindTransaction: TokenTransaction = {
          id: `earn-grind-${Date.now()}`,
          type: "earned",
          tokenType: "GRIND",
          amount: activity.grindReward,
          description: activity.name,
          timestamp: new Date(),
          source: activityId,
        }
        setTransactions((prev) => [grindTransaction, ...prev])
      }

      toast({
        title: "Tokens Earned!",
        description: `+${activity.shakaReward} SHAKA${activity.grindReward > 0 ? `, +${activity.grindReward} GRIND` : ""}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to earn tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const spendTokens = async (redemptionId: string) => {
    const redemption = redemptions.find((r) => r.id === redemptionId)
    if (!redemption) return

    if (shakaBalance < redemption.shakaCost || grindBalance < redemption.grindCost) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough tokens for this redemption.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (redemption.shakaCost > 0) {
        const shakaTransaction: TokenTransaction = {
          id: `spend-shaka-${Date.now()}`,
          type: "spent",
          tokenType: "SHAKA",
          amount: redemption.shakaCost,
          description: `Redeemed: ${redemption.name}`,
          timestamp: new Date(),
        }
        setTransactions((prev) => [shakaTransaction, ...prev])
        setShakaBalance((prev) => prev - redemption.shakaCost)
      }

      if (redemption.grindCost > 0) {
        const grindTransaction: TokenTransaction = {
          id: `spend-grind-${Date.now()}`,
          type: "spent",
          tokenType: "GRIND",
          amount: redemption.grindCost,
          description: `Redeemed: ${redemption.name}`,
          timestamp: new Date(),
        }
        setTransactions((prev) => [grindTransaction, ...prev])
        setGrindBalance((prev) => prev - redemption.grindCost)
      }

      toast({
        title: "Redemption Successful!",
        description: `Successfully redeemed ${redemption.name}`,
      })
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Failed to process redemption. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionHistory = (tokenType?: "SHAKA" | "GRIND") => {
    if (tokenType) {
      return transactions.filter((t) => t.tokenType === tokenType)
    }
    return transactions
  }

  const refreshBalances = async () => {
    setIsLoading(true)
    try {
      await loadTokenBalances()
      await loadTransactionHistory()
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalEarned = (tokenType: "SHAKA" | "GRIND") => {
    return transactions
      .filter((t) => t.tokenType === tokenType && (t.type === "earned" || t.type === "bonus"))
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalSpent = (tokenType: "SHAKA" | "GRIND") => {
    return transactions
      .filter((t) => t.tokenType === tokenType && t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const value: TokenContextType = {
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
  }

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
}

export function useTokens() {
  const context = useContext(TokenContext)
  if (context === undefined) {
    throw new Error("useTokens must be used within a TokenProvider")
  }
  return context
}
