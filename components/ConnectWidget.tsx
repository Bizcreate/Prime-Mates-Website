"use client"
import { useActiveAccount, useConnect, useDisconnect } from "thirdweb/react"
import { client } from "@/lib/client"
import { createWallet } from "thirdweb/wallets"
import { polygon, mainnet } from "thirdweb/chains"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const chainName = (process.env.NEXT_PUBLIC_DEFAULT_CHAIN || "polygon").toLowerCase()
const defaultChain = chainName === "mainnet" ? mainnet : polygon

export default function ConnectWidget() {
  const account = useActiveAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      const wallet = createWallet("io.metamask")
      await connect(async () => {
        await wallet.connect({
          client,
          chain: defaultChain,
        })
        return wallet
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  if (account) {
    return (
      <Button
        onClick={handleDisconnect}
        variant="outline"
        className="bg-primary/10 text-primary border-primary hover:bg-primary/20 font-semibold px-4 py-2 rounded-lg glow-yellow-soft"
      >
        {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary text-black border-primary hover:bg-primary/90 font-semibold px-6 py-2 rounded-lg glow-yellow-soft"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}

export { ConnectWidget }
