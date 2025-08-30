"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useActiveAccount, useDisconnect } from "thirdweb/react"
import type { NFTMetadata } from "@/lib/web3-utils"

interface WalletProfile {
  id: string
  address: string
  label: string
  isPrimary: boolean
  nfts: NFTMetadata[]
  balance: string
  lastUpdated: Date
  chainId?: number
}

interface MultiWalletContextType {
  wallets: WalletProfile[]
  primaryWallet: WalletProfile | null
  activeWallet: WalletProfile | null
  totalNFTs: number
  isLoading: boolean
  addWallet: (address: string, label?: string) => Promise<void>
  removeWallet: (walletId: string) => void
  setPrimaryWallet: (walletId: string) => void
  switchActiveWallet: (walletId: string) => void
  refreshWallet: (walletId: string) => Promise<void>
  refreshAllWallets: () => Promise<void>
  getAggregatedNFTs: () => NFTMetadata[]
  getTotalBalance: () => string
}

const MultiWalletContext = createContext<MultiWalletContextType | undefined>(undefined)

export function MultiWalletProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  const [wallets, setWallets] = useState<WalletProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const currentAddress = account?.address

  // Initialize primary wallet when account connects
  useEffect(() => {
    if (currentAddress && !wallets.find((w) => w.address.toLowerCase() === currentAddress.toLowerCase())) {
      addWallet(currentAddress, "Primary Wallet")
    }
  }, [currentAddress])

  const fetchWalletNFTs = async (address: string): Promise<NFTMetadata[]> => {
    try {
      console.log("[v0] Fetching NFTs for wallet:", address)

      // Use the NFT API endpoint that handles thirdweb integration
      const response = await fetch(`/api/nfts?wallet=${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API response:", data)

      if (data.success && Array.isArray(data.nfts)) {
        console.log("[v0] Found", data.nfts.length, "NFTs for wallet", address)
        return data.nfts.map((nft: any) => ({
          id: `${nft.contractAddress}-${nft.tokenId}`,
          name: nft.name || `Token #${nft.tokenId}`,
          image: nft.image || "/abstract-nft-concept.png",
          tokenId: nft.tokenId.toString(),
          collection: nft.collection || "Unknown Collection",
          contractAddress: nft.contractAddress,
          chainId: nft.chainId || 1,
          description: nft.description,
          attributes: nft.attributes || [],
        }))
      }

      console.log("[v0] No NFTs found or invalid response format")
      return []
    } catch (error) {
      console.error("[v0] Error fetching NFTs for wallet:", address, error)
      return []
    }
  }

  const createWalletProfile = async (address: string, label: string, isPrimary = false): Promise<WalletProfile> => {
    console.log("[v0] Creating wallet profile for:", address)
    const nfts = await fetchWalletNFTs(address)

    return {
      id: `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address,
      label,
      isPrimary,
      nfts,
      balance: "0.00", // This would be fetched from blockchain in real implementation
      lastUpdated: new Date(),
      chainId: 1, // Default to Ethereum mainnet
    }
  }

  const addWallet = async (address: string, label?: string) => {
    if (wallets.find((w) => w.address.toLowerCase() === address.toLowerCase())) {
      console.log("[v0] Wallet already exists:", address)
      return
    }

    setIsLoading(true)
    try {
      const isPrimary = wallets.length === 0
      const walletLabel = label || `Wallet ${wallets.length + 1}`
      const newWallet = await createWalletProfile(address, walletLabel, isPrimary)

      setWallets((prev) => [...prev, newWallet])
      console.log("[v0] Added wallet:", address, "with", newWallet.nfts.length, "NFTs")
    } catch (error) {
      console.error("[v0] Error adding wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeWallet = (walletId: string) => {
    setWallets((prev) => {
      const filtered = prev.filter((w) => w.id !== walletId)
      // If we removed the primary wallet, make the first remaining wallet primary
      if (filtered.length > 0 && !filtered.find((w) => w.isPrimary)) {
        filtered[0].isPrimary = true
      }
      return filtered
    })
  }

  const setPrimaryWallet = (walletId: string) => {
    setWallets((prev) =>
      prev.map((wallet) => ({
        ...wallet,
        isPrimary: wallet.id === walletId,
      })),
    )
  }

  const switchActiveWallet = (walletId: string) => {
    // In a real implementation, this would switch the active connection
    console.log("[v0] Switching to wallet:", walletId)
  }

  const refreshWallet = async (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    if (!wallet) return

    setIsLoading(true)
    try {
      console.log("[v0] Refreshing wallet:", wallet.address)
      const nfts = await fetchWalletNFTs(wallet.address)
      setWallets((prev) => prev.map((w) => (w.id === walletId ? { ...w, nfts, lastUpdated: new Date() } : w)))
      console.log("[v0] Refreshed wallet with", nfts.length, "NFTs")
    } catch (error) {
      console.error("[v0] Error refreshing wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAllWallets = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Refreshing all wallets")
      const updatedWallets = await Promise.all(
        wallets.map(async (wallet) => {
          try {
            const nfts = await fetchWalletNFTs(wallet.address)
            return { ...wallet, nfts, lastUpdated: new Date() }
          } catch (error) {
            console.error(`[v0] Error refreshing wallet ${wallet.address}:`, error)
            return wallet
          }
        }),
      )
      setWallets(updatedWallets)
      console.log("[v0] Refreshed all wallets")
    } finally {
      setIsLoading(false)
    }
  }

  const getAggregatedNFTs = (): NFTMetadata[] => {
    const allNFTs: NFTMetadata[] = []
    const seenTokens = new Set<string>()

    wallets.forEach((wallet) => {
      wallet.nfts.forEach((nft) => {
        const tokenKey = `${nft.collection}-${nft.metadata.id}`
        if (!seenTokens.has(tokenKey)) {
          seenTokens.add(tokenKey)
          allNFTs.push(nft)
        }
      })
    })

    return allNFTs
  }

  const getTotalBalance = (): string => {
    const total = wallets.reduce((sum, wallet) => sum + Number.parseFloat(wallet.balance || "0"), 0)
    return total.toFixed(4)
  }

  const primaryWallet = wallets.find((w) => w.isPrimary) || null
  const activeWallet = wallets.find((w) => w.address.toLowerCase() === currentAddress?.toLowerCase()) || primaryWallet
  const totalNFTs = getAggregatedNFTs().length

  const value: MultiWalletContextType = {
    wallets,
    primaryWallet,
    activeWallet,
    totalNFTs,
    isLoading,
    addWallet,
    removeWallet,
    setPrimaryWallet,
    switchActiveWallet,
    refreshWallet,
    refreshAllWallets,
    getAggregatedNFTs,
    getTotalBalance,
  }

  return <MultiWalletContext.Provider value={value}>{children}</MultiWalletContext.Provider>
}

export function useMultiWallet() {
  const context = useContext(MultiWalletContext)
  if (context === undefined) {
    throw new Error("useMultiWallet must be used within a MultiWalletProvider")
  }
  return context
}
