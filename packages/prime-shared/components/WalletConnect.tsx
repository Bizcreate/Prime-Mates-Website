"use client"
import { ConnectButton } from "thirdweb/react"
import { createWallet } from "thirdweb/wallets"
import { thirdwebClient } from "../thirdweb/client"

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
]

export function WalletConnect() {
  return (
    <ConnectButton
      client={thirdwebClient}
      wallets={wallets}
      connectModal={{
        size: "wide",
        title: "Connect to Prime Mates",
        showThirdwebBranding: false,
      }}
      signInButton={{
        label: "Sign In with Wallet",
      }}
    />
  )
}

// Keep original export for compatibility
export function WalletConnectButton() {
  return <ConnectButton client={thirdwebClient} />
}
