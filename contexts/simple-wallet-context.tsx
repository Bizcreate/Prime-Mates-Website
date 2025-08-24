"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          console.log("[v0] Existing wallet connection found:", accounts[0])
        }
      } catch (error) {
        console.error("[v0] Error checking wallet connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("Please install MetaMask or another Web3 wallet")
      return
    }

    setIsConnecting(true)
    try {
      console.log("[v0] Requesting wallet connection...")
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        console.log("[v0] Wallet connected successfully:", accounts[0])
        toast.success("Wallet connected successfully!")
      }
    } catch (error: any) {
      console.error("[v0] Wallet connection error:", error)
      if (error.code === 4001) {
        toast.error("Please approve the connection in your wallet")
      } else {
        toast.error("Failed to connect wallet")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    console.log("[v0] Wallet disconnected")
    toast.success("Wallet disconnected")
  }

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
          setIsConnected(true)
          console.log("[v0] Account changed to:", accounts[0])
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [address])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        connectWallet,
        disconnectWallet,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
