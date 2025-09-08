"use client"
import { ConnectButton } from "thirdweb/react"
import { thirdwebClient } from "../thirdweb/client"

export function WalletConnect() {
  return <ConnectButton client={thirdwebClient} />
}

// Keep original export for compatibility
export function WalletConnectButton() {
  return <ConnectButton client={thirdwebClient} />
}
