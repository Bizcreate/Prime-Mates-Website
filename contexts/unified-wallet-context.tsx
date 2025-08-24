"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ConnectButton, useActiveAccount, useDisconnect } from "thirdweb/react"
import { client } from "@/lib/thirdweb-client"
import { fetchUserNFTs, type NFTMetadata } from "@/lib/web3-utils"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  userNFTs: NFTMetadata[]
  loading: boolean
  connectWallet: () => void
  disconnect: () => void
  refreshNFTs: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function UnifiedWalletProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  const [userNFTs, setUserNFTs] = useState<NFTMetadata[]>([])
  const [loading, setLoading] = useState(false)

  const address = account?.address || null
  const isConnected = !!account

  const refreshNFTs = async () => {
    if (!address) return

    setLoading(true)
    try {
      console.log("[v0] Fetching NFTs for wallet:", address)
      const nfts = await fetchUserNFTs(address)
      setUserNFTs(nfts)
      console.log("[v0] Found", nfts.length, "NFTs in wallet")
    } catch (error) {
      console.error("[v0] Error fetching user NFTs:", error)
      setUserNFTs([])
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = () => {
    // This will be handled by the ConnectButton component
    console.log("[v0] Connect wallet requested")
  }

  useEffect(() => {
    if (address) {
      refreshNFTs()
    } else {
      setUserNFTs([])
    }
  }, [address])

  const value: WalletContextType = {
    address,
    isConnected,
    userNFTs,
    loading,
    connectWallet,
    disconnect,
    refreshNFTs,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a UnifiedWalletProvider")
  }
  return context
}

export function WalletConnectButton({ className = "" }: { className?: string }) {
  return (
    <ConnectButton
      client={client}
      theme="dark"
      connectButton={{
        label: "Connect Wallet",
        className: `bg-gradient-to-r from-yellow-500 to-yellow-600 hover:opacity-90 text-black font-semibold px-6 py-2 rounded-lg ${className}`,
      }}
      detailsButton={{
        className: "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700",
      }}
    />
  )
}
