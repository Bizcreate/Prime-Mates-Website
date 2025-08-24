"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { web3Service } from "@/lib/web3"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  nftBalance: number
  userNFTs: any[]
  refreshNFTs: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [nftBalance, setNftBalance] = useState(0)
  const [userNFTs, setUserNFTs] = useState<any[]>([])

  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          await refreshNFTs(accounts[0])
        }
      }
    } catch (error) {
      console.error("[v0] Error checking existing connection:", error)
    }
  }

  const connect = async () => {
    if (isConnecting) return

    setIsConnecting(true)
    try {
      const walletAddress = await web3Service.connectWallet()
      setAddress(walletAddress)
      setIsConnected(true)
      await refreshNFTs(walletAddress)
    } catch (error) {
      console.error("[v0] Wallet connection failed:", error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setNftBalance(0)
    setUserNFTs([])
  }

  const refreshNFTs = async (walletAddress?: string) => {
    const addr = walletAddress || address
    if (!addr) return

    try {
      const nfts = await web3Service.getUserNFTs(addr)
      const balance = await web3Service.checkNFTBalance(addr)
      setUserNFTs(nfts)
      setNftBalance(balance)
    } catch (error) {
      console.error("[v0] Error refreshing NFTs:", error)
    }
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        isConnecting,
        connect,
        disconnect,
        nftBalance,
        userNFTs,
        refreshNFTs,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
